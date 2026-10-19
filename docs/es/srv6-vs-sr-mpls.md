---
title: SRv6 vs SR-MPLS
seo_title: "SRv6 vs SR-MPLS: diferencias y cuándo usar cada uno"
description: "SRv6 vs SR-MPLS comparados lado a lado: plano de datos, tamaño y espacio de SID, sobrecarga y MTU, programación de red y madurez, y cuándo conviene elegir cada uno."
translation_of: topics/srv6-vs-sr-mpls.md
tags:
  - español
  - comparación
  - mpls
---

# SRv6 vs SR-MPLS

SRv6 y SR-MPLS implementan Segment Routing, pero usan planos de datos distintos. Esta es una comparación práctica.

## Tabla comparativa

| Aspecto | SR-MPLS | SRv6 |
|---------|---------|------|
| **Plano de datos** | MPLS | IPv6 |
| **Identificador de segmento** | Etiqueta de 20 bits | Dirección IPv6 de 128 bits |
| **Espacio de SID** | ~1M de etiquetas | Prácticamente ilimitado |
| **Encapsulación** | Pila de etiquetas MPLS | SRH de SRv6 (cabecera de extensión IPv6) |
| **Programación de red** | Limitada | Amplia (End, End.X, End.DT4…) |
| **Impacto en la MTU** | 4 bytes por etiqueta | 40 B de IPv6 + 8 B + 16 B por SID |
| **Infraestructura existente** | Requiere reenvío MPLS | Usa IPv6 nativo |
| **Señalización** | Ninguna (igual que SRv6) | Ninguna |
| **Madurez** | Ampliamente desplegado | En rápido crecimiento |

!!! info "La sobrecarga de SRv6 ya no es lo que era"
    La cifra de 16 bytes por SID corresponde a SRv6 clásico. Con **uSID** (RFC 9800) caben hasta 6 instrucciones en un solo contenedor de 16 bytes, lo que deja a SRv6 a la par o mejor que una pila de etiquetas MPLS. Ver [uSID](usid.md).

## Cuándo elegir cada uno

!!! tip "Elige SR-MPLS cuando..."
    - Ya tienes infraestructura MPLS
    - La sobrecarga de MTU es una preocupación
    - Tu caso de uso es principalmente ingeniería de tráfico o VPN

!!! tip "Elige SRv6 cuando..."
    - Estás construyendo una red nueva, nativa en IPv6
    - Necesitas programabilidad de red avanzada
    - La simplificación y la preparación para el futuro son prioridad
    - Quieres eliminar MPLS por completo

## Para seguir leyendo

- :material-arrow-right: [¿Qué es SRv6?](que-es-srv6.md) — Los conceptos básicos
- :material-arrow-right: [uSID](usid.md) — Cómo SRv6 reduce la sobrecarga del encabezado
- :material-arrow-right: [Interworking & Migration](../topics/interworking-migration.md) — Estrategias para migrar de MPLS a SRv6 *(en inglés)*
- :material-arrow-right: [Use Cases](../use-cases/index.md) — Casos de uso reales de SRv6 *(en inglés)*

## Referencias

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - Define la arquitectura de SR para los planos de datos MPLS e IPv6
2. [RFC 8660 - Segment Routing with the MPLS Data Plane](https://datatracker.ietf.org/doc/html/rfc8660) - Especifica el reenvío de SR-MPLS y la codificación de segmentos con etiquetas MPLS
3. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://datatracker.ietf.org/doc/rfc9800/) - Estándar de compresión de SIDs (uSID) que reduce la sobrecarga de SRv6
4. [Cisco Segment Routing Overview and Migration Guidelines](https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/mpls/215215-segment-routing-overview-and-migration-g.html) - Visión práctica del despliegue de SR y la migración desde MPLS *(en inglés)*
