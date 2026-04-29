package com.agroflex.catalog.service;

import com.agroflex.catalog.model.TipoCultivo;
import com.agroflex.catalog.repository.TipoCultivoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TipoCultivoService {

    private final TipoCultivoRepository tipoCultivoRepository;

    @Transactional(readOnly = true)
    public List<TipoCultivo> obtenerTodos() {
        return tipoCultivoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<TipoCultivo> obtenerPorCategoria(String categoria) {
        return tipoCultivoRepository.findByCategoria(categoria);
    }
}
