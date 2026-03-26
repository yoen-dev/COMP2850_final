package com.comp2850.goodfood.auth.jwt

import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.web.filter.OncePerRequestFilter

@Component
class JwtAuthenticationFilter(
    private val jwtService: JwtService
) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        filterChain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response)
            return
        }

        val token = authHeader.substring(7)

        try {
            val email = jwtService.extractEmail(token)
            val role = jwtService.extractRole(token)

            if (SecurityContextHolder.getContext().authentication == null &&
                jwtService.isTokenValid(token, email)
            ) {
                val authorities = if (role != null) {
                    listOf(SimpleGrantedAuthority("ROLE_$role"))
                } else {
                    emptyList()
                }

                val authentication = UsernamePasswordAuthenticationToken.authenticated(
                    email,
                    null,
                    authorities
                )

                SecurityContextHolder.getContext().authentication = authentication
            }
        } catch (_: Exception) {
            // token 无效就当作未登录，继续走后面的安全规则
        }

        filterChain.doFilter(request, response)
    }
}