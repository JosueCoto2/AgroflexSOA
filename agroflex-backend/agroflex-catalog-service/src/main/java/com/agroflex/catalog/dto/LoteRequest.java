package com.agroflex.catalog.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class LoteRequest {

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 200)
    private String nombreProducto;

    @Size(max = 5000)
    private String descripcion;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    private String imagenUrl;

    @NotBlank(message = "La ubicación es obligatoria")
    @Size(max = 500)
    private String ubicacion;

    @NotNull(message = "La cantidad disponible es obligatoria")
    @DecimalMin(value = "0.001", message = "La cantidad debe ser mayor a 0")
    private BigDecimal cantidadDisponible;

    @NotBlank(message = "La unidad de venta es obligatoria")
    @Size(max = 30)
    private String unidadVenta;

    @Size(max = 200)
    private String contacto;

    private Double latitud;

    private Double longitud;

    // Getters
    public String getNombreProducto()        { return nombreProducto; }
    public String getDescripcion()           { return descripcion; }
    public BigDecimal getPrecio()            { return precio; }
    public String getImagenUrl()             { return imagenUrl; }
    public String getUbicacion()             { return ubicacion; }
    public BigDecimal getCantidadDisponible(){ return cantidadDisponible; }
    public String getUnidadVenta()           { return unidadVenta; }
    public String getContacto()              { return contacto; }
    public Double getLatitud()               { return latitud; }
    public Double getLongitud()              { return longitud; }

    // Setters — requeridos para que Jackson deserialice el JSON del request
    public void setNombreProducto(String v)        { this.nombreProducto = v; }
    public void setDescripcion(String v)           { this.descripcion = v; }
    public void setPrecio(BigDecimal v)            { this.precio = v; }
    public void setImagenUrl(String v)             { this.imagenUrl = v; }
    public void setUbicacion(String v)             { this.ubicacion = v; }
    public void setCantidadDisponible(BigDecimal v){ this.cantidadDisponible = v; }
    public void setUnidadVenta(String v)           { this.unidadVenta = v; }
    public void setContacto(String v)              { this.contacto = v; }
    public void setLatitud(Double v)               { this.latitud = v; }
    public void setLongitud(Double v)              { this.longitud = v; }
}
