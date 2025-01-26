package com.example.backend.service;

import com.example.backend.entity.FreezerUser;
import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.repository.FreezerUserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
@Service
public class FreezerUserService {
/*
    private final FreezerUserRepository freezerUserRepository;

    public FreezerUserService(FreezerUserRepository freezerUserRepository) {
        this.freezerUserRepository = freezerUserRepository;
    }

    public Optional<FreezerUser> getFreezerUser(String freezerNumber, String userName) {
        return freezerUserRepository.findByFreezer_FreezerNumberAndUser_UserName(freezerNumber, userName);
    }*/
}
