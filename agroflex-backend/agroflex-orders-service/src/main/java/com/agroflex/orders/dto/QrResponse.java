package com.agroflex.orders.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QrResponse {
    private String qrCode;
    private String estado;
    private String qrUrl;
}
