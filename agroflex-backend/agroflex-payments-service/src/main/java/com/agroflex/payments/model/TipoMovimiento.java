package com.agroflex.payments.model;

public enum TipoMovimiento {
    RETENCION,   // Dinero cobrado y retenido en escrow
    LIBERACION,  // Escrow liberado al vendedor
    REEMBOLSO,   // Dinero devuelto al comprador
    COMISION     // Comisión cobrada por AgroFlex (3.5%)
}
