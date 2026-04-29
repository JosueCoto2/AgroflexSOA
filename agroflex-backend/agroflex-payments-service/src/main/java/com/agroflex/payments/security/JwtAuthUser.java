package com.agroflex.payments.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class JwtAuthUser implements UserDetails {

    private final Long idUsuario;
    private final String correo;
    private final List<GrantedAuthority> authorities;

    public JwtAuthUser(Long idUsuario, String correo, List<String> roles) {
        this.idUsuario = idUsuario;
        this.correo = correo;
        this.authorities = roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                .collect(Collectors.toList());
    }

    public Long getIdUsuario() { return idUsuario; }

    @Override public String getUsername() { return correo; }
    @Override public String getPassword() { return null; }
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}
