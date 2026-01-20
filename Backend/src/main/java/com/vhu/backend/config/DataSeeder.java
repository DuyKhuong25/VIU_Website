package com.vhu.backend.config;

import com.vhu.backend.entity.Role;
import com.vhu.backend.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        if (roleRepository.count() == 0) {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            roleRepository.save(adminRole);

            Role editorRole = new Role();
            editorRole.setName("ROLE_EDITOR");
            roleRepository.save(editorRole);

            System.out.println(">>> Đã tạo các Role mặc định: ROLE_ADMIN, ROLE_EDITOR");
        }
    }
}