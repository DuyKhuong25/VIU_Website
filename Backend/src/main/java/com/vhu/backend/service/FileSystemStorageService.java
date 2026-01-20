package com.vhu.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileSystemStorageService {

    private final Path rootLocation;
    public static final String TEMP_FOLDER = "temp";

    @Value("${file.base-url}")
    private String baseUrl;

    public FileSystemStorageService(@Value("${file.upload-dir}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir);
        try {
            Files.createDirectories(rootLocation);
            Files.createDirectories(rootLocation.resolve(TEMP_FOLDER));
        } catch (IOException e) {
            throw new RuntimeException("Không thể khởi tạo thư mục lưu trữ", e);
        }
    }

    // Lưu file vào thư mục con bên trong thư mục gốc (rootLocation)
    public String store(MultipartFile file, String folderName) {
        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        try {
            if (file.isEmpty()) throw new RuntimeException("Không thể lưu file rỗng.");
            if (originalFilename.contains("..")) throw new RuntimeException("Tên file chứa ký tự không hợp lệ.");

            Path destinationFolder = rootLocation.resolve(Paths.get(folderName)).normalize().toAbsolutePath();
            if (!destinationFolder.startsWith(rootLocation.toAbsolutePath())) {
                throw new RuntimeException("Không thể lưu file ngoài thư mục gốc.");
            }
            Files.createDirectories(destinationFolder);

            String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;
            Path destinationFile = destinationFolder.resolve(uniqueFileName);

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            return folderName + "/" + uniqueFileName;
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu file.", e);
        }
    }

    public String moveFile(String tempRelativePath, String permanentFolder) throws IOException {
        Path sourceFile = rootLocation.resolve(tempRelativePath).normalize().toAbsolutePath();
        Path destinationFolder = rootLocation.resolve(permanentFolder).normalize().toAbsolutePath();

        if (!Files.exists(sourceFile)) return null;

        Files.createDirectories(destinationFolder);
        Path destinationFile = destinationFolder.resolve(sourceFile.getFileName());

        Files.move(sourceFile, destinationFile, StandardCopyOption.REPLACE_EXISTING);

        System.out.println("Di chuyển file từ " + sourceFile + " đến " + destinationFile);

        return permanentFolder + "/" + destinationFile.getFileName().toString();
    }

    public void delete(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return;
        }
        try {
            Path file = rootLocation.resolve(filePath).normalize().toAbsolutePath();
            Files.deleteIfExists(file);
        } catch (IOException e) {
            System.err.println("Lỗi khi xóa file: " + filePath + " - " + e.getMessage());
        }
    }

    public String buildUrl(String relativePath) {
        return baseUrl + "/uploads/" + relativePath;
    }

//    public String buildUrl(String relativePath) {
//        return ServletUriComponentsBuilder.fromCurrentContextPath().path("/uploads/").path(relativePath).toUriString();
//    }
}