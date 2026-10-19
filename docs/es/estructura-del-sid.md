---
title: Estructura del SID
seo_title: "Estructura del SID en SRv6: Locator, función y argumentos"
description: "Cómo se compone un SID de SRv6 de 128 bits: Locator, función y argumentos, el bloque 5f00::/16 asignado por IANA (RFC 9602) y cómo filtrarlo en los bordes del dominio."
translation_of: topics/sid-structure.md
tags:
  - español
  - sid
  - RFC 9602
---

# Estructura del SID

Un **Segment Identifier (SID)** de SRv6 es un valor de 128 bits con formato de dirección IPv6 estándar. Codifica a la vez la ubicación de un nodo y el comportamiento que se debe ejecutar.

## Anatomía de un SID de SRv6

```
|<------------ 128 bits ------------->|
|  Locator      | Function | Arguments|
|<-- L bits --->|<-F bits->|<-A bits->|
```

| Campo | Descripción | Tamaño típico |
|-------|-------------|:-------------:|
| **Locator** | Prefijo enrutable que identifica al nodo | 40-64 bits |
| **Function** | Identifica el comportamiento local (End, End.DT4, etc.) | 16-24 bits |
| **Arguments** | Parámetros opcionales para la función | 0-48 bits |

## Ejemplo

```
SID:  5f00:0:1::100

Desglose:
  Locator:  5f00:0:1::/48   (identifica al nodo)
  Function: ::100            (End.DT4 - desencapsula y busca en la tabla IPv4)
  Args:     (ninguno)
```

!!! info "El Locator es una ruta del IGP"
    El bloque del Locator se anuncia como una ruta IPv6 normal en el IGP (IS-IS u OSPFv3). Así se garantiza la alcanzabilidad de cualquier nodo con SRv6 en la red.

## Bloque de SIDs SRv6 asignado por IANA (`5f00::/16`)

El [RFC 9602](https://datatracker.ietf.org/doc/rfc9602/) (octubre de 2024) asigna un prefijo IPv6 dedicado para los identificadores de segmento SRv6. IANA tomó el bloque del registro de direcciones unicast IPv6 y lo registró en el [IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml).

| Propiedad | Valor |
|-----------|-------|
| Bloque de direcciones | `5f00::/16` |
| Nombre | Segment Routing (SRv6) SIDs |
| RFC | [RFC 9602](https://datatracker.ietf.org/doc/rfc9602/) |
| Fecha de asignación | 2024-04 |
| Source | True |
| Destination | True |
| Forwardable | True |
| Globally Reachable | False |
| Reserved-by-Protocol | False |

El bloque `5f00::/16` se puede **reenviar dentro de los dominios SR**, pero está marcado explícitamente como **no alcanzable globalmente**: los paquetes con estas direcciones como destino no deben atravesar Internet.

Una jerarquía de asignación típica dentro del bloque:

```
5f00::/16                          <- Bloque SRv6 de IANA
  5f00:<dominio>::/32              <- Operador / dominio SR
    5f00:<dominio>:<nodo>::/48     <- Locator del nodo
      5f00:<dominio>:<nodo>:<func>::/64  <- SID (Locator + función)
```

### Prefijos GUA del operador vs `5f00::/16`

El RFC 9602 no obliga a usar `5f00::/16`. Los operadores pueden seguir usando sus propios prefijos globales (GUA) como Locators SRv6. Ambos enfoques son válidos:

| Enfoque | Origen del prefijo | Ventajas | Desventajas |
|---------|--------------------|----------|-------------|
| Bloque SRv6 de IANA | `5f00::/16` | Se reconoce al instante en capturas y ACLs; fácil de filtrar; no consume espacio GUA | No es enrutable globalmente; requiere anunciarlo explícitamente por IGP/BGP dentro del dominio SR |
| GUA del operador | /32 o /48 del proveedor | Ya es enrutable en la red del operador; sirve también para la alcanzabilidad IPv6 | Consume espacio GUA; es más difícil distinguir el tráfico SRv6 del IPv6 normal |

La mayoría de los primeros despliegues de SRv6 (China Mobile, SoftBank y otros) usan prefijos GUA del operador. El RFC 9602 ofrece una opción complementaria, especialmente útil en redes nuevas y en SRv6 entre dominios, donde un prefijo común y reconocible simplifica el filtrado.

### Filtrar `5f00::/16` en los bordes del dominio

Uses `5f00::/16` o tu propio GUA, debes evitar que los SIDs SRv6 se filtren fuera del dominio SR.

=== "Cisco IOS-XR"

    ```cisco
    prefix-set DENY-SRV6
      5f00::/16 le 128
    end-set

    route-policy EBGP-IN
      if destination in DENY-SRV6 then
        drop
      endif
    end-policy
    ```

=== "Juniper Junos"

    ```junos
    policy-options {
        prefix-list SRV6-SID-SPACE {
            5f00::/16;
        }
        policy-statement REJECT-SRV6 {
            term deny-srv6 {
                from prefix-list SRV6-SID-SPACE;
                then reject;
            }
        }
    }
    ```

=== "Linux (ip6tables)"

    ```bash
    ip6tables -A FORWARD -d 5f00::/16 -j DROP
    ```

Si usas prefijos GUA del operador, aplica el mismo principio con el rango de tus Locators (ver también la [sección 5.1 del RFC 8754](https://datatracker.ietf.org/doc/html/rfc8754#section-5.1)).

## Para seguir leyendo

- :material-arrow-right: [¿Qué es SRv6?](que-es-srv6.md) — Volver a los conceptos básicos
- :material-arrow-right: [uSID](usid.md) — Codificación comprimida de SIDs (RFC 9800)
- :material-arrow-right: [Cabecera SRH](cabecera-srh.md) — Cómo viajan los SIDs dentro del paquete
- :material-arrow-right: [Network Programming](../topics/network-programming.md) — Cómo se asocian los SIDs a comportamientos *(en inglés)*
- :material-arrow-right: [Security](../topics/security.md) — Consideraciones de seguridad de SRv6 *(en inglés)*

## Referencias

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - Define la estructura del SID y los campos Locator, función y argumentos
2. [RFC 9602 - SRv6 SIDs in the IPv6 Addressing Architecture](https://datatracker.ietf.org/doc/rfc9602/) - Asignación de IANA del bloque `5f00::/16` para SIDs SRv6
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://datatracker.ietf.org/doc/rfc8754/) - Especificación de la SRH y sus consideraciones de seguridad
4. [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/) - Registro oficial de `5f00::/16`
