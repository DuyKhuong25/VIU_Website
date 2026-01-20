package com.vhu.backend.service.impl;

import com.vhu.backend.dto.article.request.ArticleCreateRequest;
import com.vhu.backend.dto.article.request.ArticleUpdateRequest;
import com.vhu.backend.dto.article.response.*;
import com.vhu.backend.entity.*;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.*;
import com.vhu.backend.repository.specification.ArticleSpecification;
import com.vhu.backend.service.ArticleService;
import com.vhu.backend.service.FileSystemStorageService;
import com.vhu.backend.service.NotificationService;
import com.vhu.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public

class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleTranslationRepository articleTranslationRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CategoryTranslationRepository categoryTranslationRepository;
    private final TagRepository tagRepository;
    private final MediaRepository mediaRepository;
    private final ModelMapper modelMapper;
    private final NotificationService notificationService;
    private final FileSystemStorageService storageService;

    @Override
    @Transactional
    public ArticleResponse createArticle(ArticleCreateRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUserEmail = authentication.getName();
        User author = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));

        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));

        Media thumbnail = mediaRepository.findById(request.getThumbnailMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getThumbnailMediaId()));

        Article article = new Article();
        article.setAuthor(author);
        article.setCategory(category);
        article.setTags(tags);
        article.setThumbnail(thumbnail);
        article.setStatus(request.getStatus());
        article.setPinned(request.isPinned());
        if (request.getStatus() == ArticleStatus.PUBLISHED) {
            article.setPublishedAt(LocalDateTime.now());
        }

        Article savedArticle = articleRepository.saveAndFlush(article);

        try {
            // Chuyển ảnh thumbnail từ thư mục temp
            String permanentThumbnailFolder = "articles/" + savedArticle.getId();
            String newThumbnailPath = storageService.moveFile(thumbnail.getS3Key(), permanentThumbnailFolder);
            if (newThumbnailPath != null) {
                thumbnail.setS3Key(newThumbnailPath);
                thumbnail.setUrl(buildUrl(newThumbnailPath));
                assignMediaOwner(savedArticle.getId(), thumbnail.getId(), "ARTICLE_THUMBNAIL");
            }

            // Chuyển các ảnh trong content và cập nhật URL
            final String permanentContentFolder = "articles/" + savedArticle.getId() + "/images";
            request.getTranslations().forEach(transDto -> {
                ArticleTranslation translation = modelMapper.map(transDto, ArticleTranslation.class);
                String finalContent = processContentImages(translation.getContent(), savedArticle.getId(), permanentContentFolder);
                translation.setContent(finalContent);
                translation.setArticle(savedArticle);

                String slug = SlugUtil.toSlug(translation.getTitle());
                if (articleTranslationRepository.findBySlug(slug).isPresent()) {
                    slug = slug + "-" + System.currentTimeMillis();
                }
                translation.setSlug(slug);
                savedArticle.getTranslations().add(translation);
            });

            System.out.println("Đã xử lý xong ảnh cho bài viết ID: " + savedArticle.getId());

        } catch (IOException e) {
            throw new RuntimeException("Lỗi nghiêm trọng khi xử lý file ảnh cho bài viết.", e);
        }

        Article finalArticle = articleRepository.save(savedArticle);

        if (author.getRoles().stream().anyMatch(role -> role.getName().equals("ROLE_EDITOR") || role.getName().equals("ROLE_MANAGER"))) {
            notificationService.createAndSendNotification(
                    author,
                    NotificationType.ARTICLE_SUBMITTED_FOR_REVIEW,
                    finalArticle,
                    Set.of("ROLE_ADMIN")
            );
        }

        return mapToArticleResponse(finalArticle, "vi");
    }

    @Override
    @Transactional
    public ArticleResponse updateArticle(Long articleId, ArticleUpdateRequest request) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", articleId));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.getCategoryId()));
        Set<Tag> tags = new HashSet<>(tagRepository.findAllById(request.getTagIds()));
        Media newThumbnail = mediaRepository.findById(request.getThumbnailMediaId())
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", request.getThumbnailMediaId()));

        try {
            // Bỏ thumbnail cũ nếu nó bị thay đổi
            if (article.getThumbnail() != null && !article.getThumbnail().getId().equals(newThumbnail.getId())) {
                unassignMediaOwner(article.getThumbnail().getId());

                String permanentThumbnailFolder = "articles/" + article.getId();
                String newThumbnailPath = storageService.moveFile(newThumbnail.getS3Key(), permanentThumbnailFolder);
                if(newThumbnailPath != null) {
                    newThumbnail.setS3Key(newThumbnailPath);
                    newThumbnail.setUrl(buildUrl(newThumbnailPath));
                }
            }
            article.setThumbnail(newThumbnail);
            assignMediaOwner(article.getId(), newThumbnail.getId(), "ARTICLE_THUMBNAIL");
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi cập nhật ảnh thumbnail.", e);
        }

        article.setCategory(category);
        article.setTags(tags);
        article.setStatus(request.getStatus());
        article.setPinned(request.isPinned());
        if(request.getStatus() == ArticleStatus.PUBLISHED && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }

        unassignOldContentImages(article);

        final String permanentContentFolder = "articles/" + article.getId() + "/images";
        Map<String, ArticleTranslation> existingTranslations = article.getTranslations().stream()
                .collect(Collectors.toMap(ArticleTranslation::getLanguageCode, t -> t));
        request.getTranslations().forEach(transDto -> {
            ArticleTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                String finalContent = processContentImages(transDto.getContent(), article.getId(), permanentContentFolder);
                translation.setTitle(transDto.getTitle());
                translation.setContent(finalContent);
                translation.setExcerpt(transDto.getExcerpt());
                translation.setSlug(SlugUtil.toSlug(transDto.getTitle()));
            }
        });

        unassignOldContentImages(article);

        Article updatedArticle = articleRepository.save(article);
        return mapToArticleResponse(updatedArticle, "vi");
    }

    @Override
    public ArticleResponse getArticleById(Long articleId, Locale locale) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", articleId));
        return mapToArticleResponse(article, locale.getLanguage());
    }

    @Override
    public Page<ArticleResponse> getAllArticles(int page, int size, String search) {
        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("publishedAt"),
                Sort.Order.desc("id")
        );
        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Article> spec = ArticleSpecification.searchByTitle(search);
        Page<Article> articlePage = articleRepository.findAll(spec, pageable);
        return articlePage.map(article -> mapToArticleResponse(article, "vi"));
    }

    @Override
    @Transactional
    public ArticleResponse togglePinStatus(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", articleId));

        article.setPinned(!article.isPinned());
        Article updatedArticle = articleRepository.save(article);
        return mapToArticleResponse(updatedArticle, "vi");
    }

    @Override
    public ArticleResponse getArticleBySlug(String slug) {
        ArticleTranslation translation = articleTranslationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "slug", slug));
        return mapToArticleResponse(translation.getArticle(), translation.getLanguageCode());
    }

    @Override
    @Transactional
    public void deleteArticle(Long articleId) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResourceNotFoundException("Article", "id", articleId));

        if (article.getThumbnail() != null) {
            unassignMediaOwner(article.getThumbnail().getId());
        }
        unassignOldContentImages(article);

        articleRepository.delete(article);
    }

    @Override
    public List<ArticleTitleResponse> getAllArticleTitles() {
        return articleRepository.findAll(Sort.by("id").descending()).stream()
                .map(article -> {
                    ArticleTitleResponse res = new ArticleTitleResponse();
                    res.setId(article.getId());
                    String title = article.getTranslations().stream()
                            .filter(t -> "vi".equals(t.getLanguageCode()))
                            .findFirst()
                            .map(ArticleTranslation::getTitle)
                            .orElse("Bài viết không có tiêu đề");
                    res.setTitle(title);
                    return res;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> searchPublicArticles(String query, String languageCode) {
        Specification<Article> titleSpec = ArticleSpecification.searchByTitle(query);

        Specification<Article> statusSpec = (root, q, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("status"), ArticleStatus.PUBLISHED);

        Specification<Article> finalSpec = Specification.where(titleSpec).and(statusSpec);

        Sort sort = Sort.by(Sort.Direction.DESC, "publishedAt");

        List<Article> articles = articleRepository.findAll(finalSpec, sort);

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getLatestArticles(String languageCode, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("publishedAt").descending());

        List<Article> articles = articleRepository.findByStatus(ArticleStatus.PUBLISHED, pageable);

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

//    private String processContentImages(String content, Long articleId, String permanentFolder) {
//        if (content == null || content.isBlank()) return content;
//
//        Pattern pattern = Pattern.compile("src=\"[^\"]*?/uploads/temp/([^\"]+)\"");
//        Matcher matcher = pattern.matcher(content);
//        StringBuffer sb = new StringBuffer();
//
//        while (matcher.find()) {
//            String tempFileNameWithEncoding = matcher.group(1);
//
//            String tempFileName = java.net.URLDecoder.decode(tempFileNameWithEncoding, java.nio.charset.StandardCharsets.UTF_8).replace("%20", " ");
//
//            String tempRelativePath = FileSystemStorageService.TEMP_FOLDER + "/" + tempFileName;
//
//            try {
//                String newRelativePath = storageService.moveFile(tempRelativePath, permanentFolder);
//                if (newRelativePath == null) {
//                    matcher.appendReplacement(sb, matcher.group(0));
//                    continue;
//                }
//
//                mediaRepository.findByS3Key(tempRelativePath).ifPresent(media -> {
//                    media.setS3Key(newRelativePath);
//                    media.setUrl(buildUrl(newRelativePath));
//                    media.setOwnerId(articleId);
//                    media.setOwnerType("ARTICLE_CONTENT");
//                    mediaRepository.save(media);
//                });
//
//                String newUrl = buildUrl(newRelativePath);
//                matcher.appendReplacement(sb, "src=\"" + Matcher.quoteReplacement(newUrl) + "\"");
//
//            } catch (IOException e) {
//                matcher.appendReplacement(sb, matcher.group(0));
//            }
//        }
//        matcher.appendTail(sb);
//        return sb.toString();
//    }

    private String processContentImages(String content, Long articleId, String permanentFolder) {
        if (content == null || content.isBlank()) return content;
        Pattern pattern = Pattern.compile("src=\"[^\"]*?/uploads/(temp|articles/\\d+/images)/([^\"]+)\"");

        Matcher matcher = pattern.matcher(content);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()) {
            String folderType = matcher.group(1);
            String rawFileName = matcher.group(2);

            String cleanFileName = rawFileName.replace("%20", "").replace(" ", "").trim();

            if ("temp".equals(folderType)) {

                String decodedFileName = java.net.URLDecoder.decode(rawFileName, java.nio.charset.StandardCharsets.UTF_8);
                String tempRelativePath = FileSystemStorageService.TEMP_FOLDER + "/" + decodedFileName;

                try {
                    String newRelativePath = storageService.moveFile(tempRelativePath, permanentFolder);

                    if (newRelativePath != null) {
                        mediaRepository.findByS3Key(tempRelativePath).ifPresent(media -> {
                            media.setS3Key(newRelativePath);
                            media.setUrl(buildUrl(newRelativePath));
                            media.setOwnerId(articleId);
                            media.setOwnerType("ARTICLE_CONTENT");
                            mediaRepository.saveAndFlush(media);
                        });
                        String realUrl = buildUrl(newRelativePath);
                        matcher.appendReplacement(sb, "src=\"" + Matcher.quoteReplacement(realUrl) + "\"");
                    } else {
                        String forcedUrl = buildUrl(permanentFolder + "/" + cleanFileName);
                        matcher.appendReplacement(sb, "src=\"" + Matcher.quoteReplacement(forcedUrl) + "\"");
                    }
                } catch (Exception e) {
                    String forcedUrl = buildUrl(permanentFolder + "/" + cleanFileName);
                    matcher.appendReplacement(sb, "src=\"" + Matcher.quoteReplacement(forcedUrl) + "\"");
                }

            } else {
                String fixedUrl = buildUrl(folderType + "/" + cleanFileName);
                matcher.appendReplacement(sb, "src=\"" + Matcher.quoteReplacement(fixedUrl) + "\"");
            }
        }
        matcher.appendTail(sb);
        return sb.toString();
    }

    private void assignMediaOwner(Long ownerId, Long mediaId, String ownerType) {
        mediaRepository.findById(mediaId).ifPresent(media -> {
            media.setOwnerId(ownerId);
            media.setOwnerType(ownerType);
            mediaRepository.save(media);
        });
    }

    private void unassignMediaOwner(Long mediaId) {
        mediaRepository.findById(mediaId).ifPresent(media -> {
            media.setOwnerId(null);
            media.setOwnerType(null);
            mediaRepository.save(media);
        });
    }

    private List<String> extractUrlsFromContent(Article article) {
        List<String> urls = new ArrayList<>();
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        // Pattern để tìm URL chính thức (không phải temp)
        Pattern pattern = Pattern.compile(Pattern.quote(baseUrl) + "/uploads/articles/" + article.getId() + "/images/[^\"]+");

        article.getTranslations().forEach(translation -> {
            if (translation.getContent() != null) {
                Matcher matcher = pattern.matcher(translation.getContent());
                while (matcher.find()) {
                    urls.add(matcher.group());
                }
            }
        });
        return urls.stream().distinct().collect(Collectors.toList());
    }

    private void unassignOldContentImages(Article article) {
        List<String> newUrls = extractUrlsFromContent(article);
        List<Media> oldMedia = mediaRepository.findByOwnerIdAndOwnerType(article.getId(), "ARTICLE_CONTENT");

        oldMedia.forEach(media -> {
            if (!newUrls.contains(media.getUrl())) {
                unassignMediaOwner(media.getId());
            }
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getPinnedArticles(String languageCode, int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("publishedAt").descending());
        List<Article> articles = articleRepository.findByIsPinnedTrueAndStatusOrderByPublishedAtDesc(ArticleStatus.PUBLISHED, pageable);

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getLatestArticlesByCategoryId(Integer categoryId, String languageCode, int limit) {
        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("publishedAt")
        );
        Pageable pageable = PageRequest.of(0, limit, sort);

        List<Article> articles = articleRepository.findByCategoryIdAndStatus(categoryId, ArticleStatus.PUBLISHED, pageable);

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getLatestArticlesByCategorySlug(String slug, String languageCode, int limit) {
        CategoryTranslation categoryTranslation = categoryTranslationRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));

        Category category = categoryTranslation.getCategory();
        List<Integer> categoryIds = getAllDescendantIds(category);

        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("publishedAt")
        );

        Pageable pageable = PageRequest.of(0, limit, sort);

        List<Article> articles = articleRepository.findByCategoryIdInAndStatus(categoryIds, ArticleStatus.PUBLISHED, pageable);

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    private List<Integer> getAllDescendantIds(Category category) {
        List<Integer> ids = new ArrayList<>();
        ids.add(category.getId());
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            for (Category child : category.getChildren()) {
                ids.addAll(getAllDescendantIds(child));
            }
        }
        return ids;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ArticleResponse> getRelatedArticles(Long articleId, Integer categoryId, String languageCode, int limit) {
        Sort sort = Sort.by(
                Sort.Order.desc("isPinned"),
                Sort.Order.desc("publishedAt")
        );
        Pageable pageable = PageRequest.of(0, limit, sort);

        List<Article> articles = articleRepository.findByCategoryIdAndStatusAndIdNot(
                categoryId,
                ArticleStatus.PUBLISHED,
                articleId,
                pageable
        );

        return articles.stream()
                .map(article -> mapToArticleResponse(article, languageCode))
                .collect(Collectors.toList());
    }

    private String buildUrl(String relativePath) {
        return ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(relativePath).toUriString();
    }

    @Override
    @Transactional(readOnly = true)
    public ArticleResponse mapToArticleResponse(Article article, String languageCode) {
        ArticleResponse res = new ArticleResponse();
        res.setId(article.getId());
        res.setStatus(article.getStatus());
        res.setPinned(article.isPinned());
        res.setPublishedAt(article.getPublishedAt());
        res.setCreatedAt(article.getCreatedAt());

        if (article.getThumbnail() != null) {
            res.setThumbnailUrl(article.getThumbnail().getUrl());
            res.setThumbnailMediaId(article.getThumbnail().getId());
        }

        UserSimpleResponse authorDto = modelMapper.map(article.getAuthor(), UserSimpleResponse.class);
        res.setAuthor(authorDto);

        CategorySimpleResponse catDto = new CategorySimpleResponse();
        catDto.setId(article.getCategory().getId());
        article.getCategory().getTranslations().stream()
                .filter(t -> languageCode.equals(t.getLanguageCode()))
                .findFirst()
                .or(() -> article.getCategory().getTranslations().stream()
                        .filter(t -> "vi".equals(t.getLanguageCode()))
                        .findFirst())
                .or(() -> article.getCategory().getTranslations().stream().findFirst())
                .ifPresent(trans -> {
                    catDto.setName(trans.getName());
                    catDto.setSlug(trans.getSlug());
                });
        res.setCategory(catDto);

        Set<TagSimpleResponse> tagDtos = article.getTags().stream().map(tag -> {
            TagSimpleResponse tagDto = new TagSimpleResponse();
            tagDto.setId(tag.getId());
            tag.getTranslations().stream()
                    .filter(t -> languageCode.equals(t.getLanguageCode()))
                    .findFirst()
                    .or(() -> tag.getTranslations().stream()
                            .filter(t -> "vi".equals(t.getLanguageCode()))
                            .findFirst())
                    .or(() -> tag.getTranslations().stream().findFirst())
                    .ifPresent(trans -> {
                        tagDto.setName(trans.getName());
                        tagDto.setSlug(trans.getSlug());
                    });
            return tagDto;
        }).collect(Collectors.toSet());
        res.setTags(tagDtos);

        List<ArticleTranslationResponse> transDtos = article.getTranslations().stream()
                .map(t -> modelMapper.map(t, ArticleTranslationResponse.class))
                .collect(Collectors.toList());
        res.setTranslations(transDtos);

        return res;
    }
}