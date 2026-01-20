package com.vhu.backend.service.impl;

import com.vhu.backend.dto.academics.request.MajorRequest;
import com.vhu.backend.dto.academics.request.ProgramLevelRequest;
import com.vhu.backend.dto.academics.request.SpecializationRequest;
import com.vhu.backend.dto.academics.response.MajorResponse;
import com.vhu.backend.dto.academics.response.ProgramLevelResponse;
import com.vhu.backend.dto.academics.response.SpecializationResponse;
import com.vhu.backend.dto.academics.response.TranslationResponse;
import com.vhu.backend.dto.request.TranslationRequest;
import com.vhu.backend.entity.*;
import com.vhu.backend.exception.DuplicateResourceException;
import com.vhu.backend.exception.ResourceNotFoundException;
import com.vhu.backend.repository.MajorRepository;
import com.vhu.backend.repository.ProgramLevelRepository;
import com.vhu.backend.service.MajorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MajorServiceImpl implements MajorService {

    private final MajorRepository majorRepository;
    private final ProgramLevelRepository programLevelRepository;

    // I. LOGIC XỬ LÝ CHƯƠNG TRÌNH ĐÀO TẠO (PROGRAM LEVEL)

    @Override
    @Transactional
    public ProgramLevelResponse createProgramLevel(ProgramLevelRequest request) {
        ProgramLevel programLevel = new ProgramLevel();

        checkProgramLevelDuplicates(null, request.getCode(), request.getTranslations());

        programLevel.setCode(request.getCode());

        request.getTranslations().forEach(transDto -> {
            ProgramLevelTranslation translation = new ProgramLevelTranslation();
            translation.setProgramLevel(programLevel);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setName(transDto.getTitle());
            programLevel.getTranslations().add(translation);
        });

        ProgramLevel savedProgramLevel = programLevelRepository.save(programLevel);
        return mapToDetailProgramLevelResponse(savedProgramLevel);
    }

    @Override
    public List<ProgramLevelResponse> getAllProgramLevels(String lang) {
        return programLevelRepository.findAll().stream()
                .map(pl -> mapToSimpleProgramLevelResponse(pl, lang))
                .collect(Collectors.toList());
    }

    @Override
    public ProgramLevelResponse getProgramLevelById(Long id) {
        ProgramLevel programLevel = programLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramLevel", "id", id));
        return mapToDetailProgramLevelResponse(programLevel);
    }

    @Override
    @Transactional
    public ProgramLevelResponse updateProgramLevel(Long id, ProgramLevelRequest request) {
        ProgramLevel programLevel = programLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramLevel", "id", id));

        checkProgramLevelDuplicates(id, request.getCode(), request.getTranslations());

        programLevel.setCode(request.getCode());

        Map<String, ProgramLevelTranslation> existingTranslations = programLevel.getTranslations().stream()
                .collect(Collectors.toMap(ProgramLevelTranslation::getLanguageCode, t -> t));

        request.getTranslations().forEach(transDto -> {
            ProgramLevelTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setName(transDto.getTitle());
            } else {
                ProgramLevelTranslation newTranslation = new ProgramLevelTranslation();
                newTranslation.setProgramLevel(programLevel);
                newTranslation.setLanguageCode(transDto.getLanguageCode());
                newTranslation.setName(transDto.getTitle());
                programLevel.getTranslations().add(newTranslation);
            }
        });

        ProgramLevel updatedProgramLevel = programLevelRepository.save(programLevel);
        return mapToDetailProgramLevelResponse(updatedProgramLevel);
    }

    @Override
    @Transactional
    public void deleteProgramLevel(Long id) {
        ProgramLevel programLevel = programLevelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProgramLevel", "id", id));
        programLevelRepository.delete(programLevel);
    }

    // II. LOGIC XỬ LÝ NGÀNH ĐÀO TẠO (MAJOR)

    @Override
    @Transactional
    public MajorResponse createMajor(MajorRequest request) {
        ProgramLevel programLevel = programLevelRepository.findById(request.getProgramLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("ProgramLevel", "id", request.getProgramLevelId()));

        checkMajorDuplicates(null, request.getProgramLevelId(), request.getTranslations());

        checkSpecializationDuplicates(request.getSpecializations());

        Major major = new Major();
        major.setProgramLevel(programLevel);

        request.getTranslations().forEach(transDto -> {
            MajorTranslation translation = new MajorTranslation();
            translation.setMajor(major);
            translation.setLanguageCode(transDto.getLanguageCode());
            translation.setName(transDto.getTitle());
            major.getTranslations().add(translation);
        });

        if (request.getSpecializations() != null) {
            request.getSpecializations().forEach(specDto -> addSpecializationToMajor(major, specDto));
        }

        Major savedMajor = majorRepository.save(major);
        return mapToDetailMajorResponse(savedMajor);
    }

    @Override
    @Transactional
    public MajorResponse updateMajor(Long id, MajorRequest request) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Major", "id", id));

        checkMajorDuplicates(id, request.getProgramLevelId(), request.getTranslations());

        checkSpecializationDuplicates(request.getSpecializations());

        ProgramLevel programLevel = programLevelRepository.findById(request.getProgramLevelId())
                .orElseThrow(() -> new ResourceNotFoundException("ProgramLevel", "id", request.getProgramLevelId()));
        major.setProgramLevel(programLevel);

        Map<String, MajorTranslation> existingTranslations = major.getTranslations().stream()
                .collect(Collectors.toMap(MajorTranslation::getLanguageCode, t -> t));
        request.getTranslations().forEach(transDto -> {
            MajorTranslation translation = existingTranslations.get(transDto.getLanguageCode());
            if (translation != null) {
                translation.setName(transDto.getTitle());
            } else {
                MajorTranslation newTranslation = new MajorTranslation();
                newTranslation.setMajor(major);
                newTranslation.setLanguageCode(transDto.getLanguageCode());
                newTranslation.setName(transDto.getTitle());
                major.getTranslations().add(newTranslation);
            }
        });

        major.getSpecializations().clear();
        if (request.getSpecializations() != null) {
            request.getSpecializations().forEach(specDto -> addSpecializationToMajor(major, specDto));
        }

        Major updatedMajor = majorRepository.save(major);
        return mapToDetailMajorResponse(updatedMajor);
    }

    @Override
    public Page<MajorResponse> getAllMajors(Pageable pageable, String lang) {
        return majorRepository.findAll(pageable).map(major -> mapToSimpleMajorResponse(major, lang));
    }

    @Override
    public MajorResponse getMajorById(Long id) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Major", "id", id));
        return mapToDetailMajorResponse(major);
    }

    @Override
    @Transactional
    public void deleteMajor(Long id) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Major", "id", id));
        majorRepository.delete(major);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MajorResponse> getPublicMajors(String lang) {
        List<Major> majors = majorRepository.findAll();

        // Map chúng bằng một hàm helper public MỚI
        return majors.stream()
                .map(major -> mapToPublicMajorResponse(major, lang))
                .collect(Collectors.toList());
    }

    // III. CÁC HÀM TIỆN ÍCH VÀ MAPPING

    /*** Hàm helper: Dùng cho API public */
    private MajorResponse mapToPublicMajorResponse(Major major, String lang) {
        MajorResponse res = new MajorResponse();
        res.setId(major.getId());

        // 1. Map tên ngành (Major)
        major.getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .or(() -> major.getTranslations().stream().filter(t -> "vi".equals(t.getLanguageCode())).findFirst())
                .or(() -> major.getTranslations().stream().findFirst())
                .ifPresent(trans -> res.setName(trans.getName()));

        // 2. Map bản dịch của ngành (Major)
        res.setTranslations(
                major.getTranslations().stream().map(t -> {
                    TranslationResponse tr = new TranslationResponse();
                    tr.setLanguageCode(t.getLanguageCode());
                    tr.setTitle(t.getName()); // DTO của bạn dùng 'title'
                    return tr;
                }).collect(Collectors.toList())
        );

        // 3. Map ProgramLevel (Hệ đào tạo)
        res.setProgramLevel(mapToSimpleProgramLevelResponse(major.getProgramLevel(), lang));

        // 4. Map các chuyên ngành (Specializations)
        List<SpecializationResponse> specResponses = major.getSpecializations().stream().map(spec -> {
            SpecializationResponse specRes = new SpecializationResponse();
            specRes.setId(spec.getId());

            spec.getTranslations().stream()
                    .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                    .findFirst()
                    .or(() -> spec.getTranslations().stream().filter(t -> "vi".equals(t.getLanguageCode())).findFirst())
                    .or(() -> spec.getTranslations().stream().findFirst())
                    .ifPresent(trans -> specRes.setName(trans.getName()));

            specRes.setTranslations(
                    spec.getTranslations().stream().map(t -> {
                        TranslationResponse tr = new TranslationResponse();
                        tr.setLanguageCode(t.getLanguageCode());
                        tr.setTitle(t.getName());
                        return tr;
                    }).collect(Collectors.toList())
            );
            return specRes;
        }).collect(Collectors.toList());

        res.setSpecializations(specResponses);
        res.setSpecializationCount(specResponses.size());

        return res;
    }

    // Hàm kiểm tra trùng lặp Chương trình đào tạo
    private void checkProgramLevelDuplicates(Long currentId, String code, List<TranslationRequest> translations) {
        // 1. Kiểm tra trùng lặp Code
        programLevelRepository.findByCode(code).ifPresent(existing -> {
            if (currentId == null || !existing.getId().equals(currentId)) {
                throw new DuplicateResourceException("Mã chương trình này đã tồn tại.");
            }
        });

        // 2. Kiểm tra trùng lặp Tên (VI và EN)
        for (TranslationRequest trans : translations) {
            programLevelRepository.findByTranslation(trans.getLanguageCode(), trans.getTitle()).ifPresent(existing -> {
                if (currentId == null || !existing.getId().equals(currentId)) {
                    String fieldName = trans.getLanguageCode().equals("vi") ? "translations[0].title" : "translations[1].title";
                    throw new DuplicateResourceException(fieldName + ":Tên chương trình này đã tồn tại.");
                }
            });
        }
    }

    // Hàm để thêm chuyên ngành
    private void addSpecializationToMajor(Major major, SpecializationRequest specDto) {
        Specialization specialization = new Specialization();
        specialization.setMajor(major);

        specDto.getTranslations().forEach(specTransDto -> {
            SpecializationTranslation specTranslation = new SpecializationTranslation();
            specTranslation.setSpecialization(specialization);
            specTranslation.setLanguageCode(specTransDto.getLanguageCode());
            specTranslation.setName(specTransDto.getTitle());
            specialization.getTranslations().add(specTranslation);
        });
        major.getSpecializations().add(specialization);
    }

    // --- Hàm cho ProgramLevel ---
    // Hàm mapping đơn giản ProgramLevel
    private ProgramLevelResponse mapToSimpleProgramLevelResponse(ProgramLevel programLevel, String lang) {
        ProgramLevelResponse res = new ProgramLevelResponse();
        res.setId(programLevel.getId());
        res.setCode(programLevel.getCode());
        programLevel.getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .ifPresent(trans -> res.setName(trans.getName()));
        return res;
    }

    // Hàm mapping chi tiết ProgramLevel
    private ProgramLevelResponse mapToDetailProgramLevelResponse(ProgramLevel programLevel) {
        ProgramLevelResponse res = mapToSimpleProgramLevelResponse(programLevel, "vi");
        res.setTranslations(
                programLevel.getTranslations().stream().map(t -> {
                    TranslationResponse tr = new TranslationResponse();
                    tr.setLanguageCode(t.getLanguageCode());
                    tr.setTitle(t.getName());
                    return tr;
                }).collect(Collectors.toList())
        );
        return res;
    }

    // --- Hàm cho Major ---
    // Hàm mapping đơn giản Major
    private MajorResponse mapToSimpleMajorResponse(Major major, String lang) {
        MajorResponse res = new MajorResponse();
        res.setId(major.getId());

        major.getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .ifPresent(trans -> res.setName(trans.getName()));

        major.getProgramLevel().getTranslations().stream()
                .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                .findFirst()
                .ifPresent(trans -> res.setProgramLevelName(trans.getName()));

        List<SpecializationResponse> specResponses = major.getSpecializations().stream().map(spec -> {
            SpecializationResponse specRes = new SpecializationResponse();
            specRes.setId(spec.getId());

            spec.getTranslations().stream()
                    .filter(t -> lang.equalsIgnoreCase(t.getLanguageCode()))
                    .findFirst()
                    .ifPresentOrElse(
                            trans -> specRes.setName(trans.getName()),
                            () -> spec.getTranslations().stream().findFirst()
                                    .ifPresent(anyTrans -> specRes.setName(anyTrans.getName()))
                    );
            return specRes;
        }).collect(Collectors.toList());

        res.setSpecializations(specResponses);
        res.setSpecializationCount(major.getSpecializations().size());
        return res;
    }

    // Hàm mapping chi tiết Major
    private MajorResponse mapToDetailMajorResponse(Major major) {
        MajorResponse res = mapToSimpleMajorResponse(major, "vi");

        res.setProgramLevel(mapToDetailProgramLevelResponse(major.getProgramLevel()));

        res.setTranslations(
                major.getTranslations().stream().map(t -> {
                    TranslationResponse tr = new TranslationResponse();
                    tr.setLanguageCode(t.getLanguageCode());
                    tr.setTitle(t.getName());
                    return tr;
                }).collect(Collectors.toList())
        );

        res.setSpecializations(
                major.getSpecializations().stream().map(spec -> {
                    SpecializationResponse sr = new SpecializationResponse();
                    sr.setId(spec.getId());
                    sr.setTranslations(
                            spec.getTranslations().stream().map(t -> {
                                TranslationResponse tr = new TranslationResponse();
                                tr.setLanguageCode(t.getLanguageCode());
                                tr.setTitle(t.getName());
                                return tr;
                            }).collect(Collectors.toList())
                    );
                    return sr;
                }).collect(Collectors.toList())
        );
        return res;
    }

    // Hàm kiểm tra trùng lặp ngành học
    private void checkMajorDuplicates(Long currentId, Long programLevelId, List<TranslationRequest> translations) {
        for (TranslationRequest trans : translations) {
            majorRepository.findByTranslationAndProgramLevel(trans.getLanguageCode(), trans.getTitle(), programLevelId).ifPresent(existing -> {
                if (currentId == null || !existing.getId().equals(currentId)) {
                    String fieldName = trans.getLanguageCode().equals("vi") ? "translations[0].title" : "translations[1].title";
                    throw new DuplicateResourceException(fieldName + ":Tên ngành này đã tồn tại trong chương trình đào tạo đã chọn.");
                }
            });
        }
    }

    // Hàm kiểm tra trùng lặp Chuyên ngành
    private void checkSpecializationDuplicates(List<SpecializationRequest> specializations) {
        if (specializations == null || specializations.isEmpty()) {
            return;
        }

        Set<String> viNames = new HashSet<>();
        Set<String> enNames = new HashSet<>();

        for (int i = 0; i < specializations.size(); i++) {
            SpecializationRequest specDto = specializations.get(i);

            String viName = specDto.getTranslations().stream()
                    .filter(t -> "vi".equals(t.getLanguageCode()))
                    .map(TranslationRequest::getTitle)
                    .findFirst().orElse("").trim();

            if (!viName.isEmpty()) {
                if (viNames.contains(viName)) {
                    // Ném lỗi với "key" chính xác là index của mảng
                    throw new DuplicateResourceException("spec_" + i + "_name_vi:Tên chuyên ngành (Tiếng Việt) bị trùng lặp.");
                }
                viNames.add(viName);
            }

            String enName = specDto.getTranslations().stream()
                    .filter(t -> "en".equals(t.getLanguageCode()))
                    .map(TranslationRequest::getTitle)
                    .findFirst().orElse("").trim();

            if (!enName.isEmpty()) {
                if (enNames.contains(enName)) {
                    throw new DuplicateResourceException("spec_" + i + "_name_en:Tên chuyên ngành (Tiếng Anh) bị trùng lặp.");
                }
                enNames.add(enName);
            }
        }
    }
}