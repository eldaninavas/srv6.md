---
title: uSID
seo_title: "uSID en SRv6: compresión de micro-SID explicada"
description: "Qué es uSID (micro-SID) en SRv6 y cómo reduce la sobrecarga del encabezado: estructura, operación shift-and-lookup, comparación con SRv6 clásico, uSID vs G-SRv6 y RFC 9800."
translation_of: topics/usid-compression.md
tags:
  - español
  - usid
  - rfc9800
---

# uSID: compresión de SIDs en SRv6

Una de las primeras críticas a SRv6 fue la **sobrecarga**: cada SID ocupa 128 bits (16 bytes), y una lista de 5 SIDs suma 80 bytes a cada paquete. El **Micro-SID (uSID)** lo resuelve empaquetando varias instrucciones de segmento en un solo SID de 128 bits.

## El problema

Con SRv6 clásico, cada salto de la lista de segmentos cuesta 16 bytes:

```
SRv6 clásico (5 SIDs = 80 bytes de sobrecarga):
┌──────────────────────────────────────────────┐
│ SRH: lista de segmentos                       │
│   [0]: fc00:0:5::1  (16 bytes)               │
│   [1]: fc00:0:4::1  (16 bytes)               │
│   [2]: fc00:0:3::1  (16 bytes)               │
│   [3]: fc00:0:2::1  (16 bytes)               │
│   [4]: fc00:0:1::1  (16 bytes)               │
│                          Total: 80 bytes      │
└──────────────────────────────────────────────┘
```

Para paquetes pequeños o tráfico sensible a la latencia, esta sobrecarga es importante.

## La solución: Micro-SID (uSID)

uSID (RFC 9800) empaqueta **hasta 6 microinstrucciones** en un solo contenedor de 128 bits:

```
Contenedor uSID (6 micro-SIDs = 16 bytes en total):
┌──────────────────────────────────────────────┐
│ Una sola dirección IPv6 de 128 bits:          │
│                                               │
│  fcbb:bbbb:0001:0002:0003:0004:0005:0006    │
│  ├──┬────┤├──┤├──┤├──┤├──┤├──┤├──┤          │
│  │Bloque ││uS1││uS2││uS3││uS4││uS5││uS6│    │
│  │(32bit)││16b││16b││16b││16b││16b││16b│     │
│                          Total: 16 bytes      │
└──────────────────────────────────────────────┘
```

### Estructura

| Componente | Tamaño | Descripción |
|------------|:------:|-------------|
| **Bloque uSID** | 32 bits | Prefijo común a todos los uSIDs del dominio (por ejemplo, `fcbb:bbbb`) |
| **uSID** | 16 bits cada uno | Microinstrucción individual que identifica un nodo y un comportamiento |
| **Fin de contenedor** | 16 bits (0000) | Marca el final de los uSIDs activos en el contenedor |

### Cómo funciona

Procesar un contenedor uSID es una operación sencilla de **desplazar y buscar** (*shift-and-lookup*):

```
Paso 1 - El ingress recibe:
  DA = fcbb:bbbb:0001:0002:0003:0000:0000:0000
                  ^^^^
                  uSID activo → Nodo 1

Paso 2 - El Nodo 1 procesa el uSID 0001 y desplaza a la izquierda:
  DA = fcbb:bbbb:0002:0003:0000:0000:0000:0000
                  ^^^^
                  uSID activo → Nodo 2

Paso 3 - El Nodo 2 procesa el uSID 0002 y desplaza a la izquierda:
  DA = fcbb:bbbb:0003:0000:0000:0000:0000:0000
                  ^^^^
                  uSID activo → Nodo 3

Paso 4 - El Nodo 3 procesa el uSID 0003. Todo lo que sigue es 0000
         (fin de contenedor), así que no queda nada que desplazar:
  DA = fcbb:bbbb:0003:0000:0000:0000:0000:0000
                  ^^^^
                  Último uSID → con SRH, toma el siguiente contenedor
                  (Segments Left - 1); sin SRH, ejecuta el comportamiento final
```

## Comparación de sobrecarga

| Escenario | SRv6 clásico | uSID | Ahorro |
|-----------|:------------:|:----:|:------:|
| 3 SIDs | 48 bytes | 16 bytes | **67%** |
| 6 SIDs | 96 bytes | 16 bytes | **83%** |
| 10 SIDs | 160 bytes | 32 bytes (2 contenedores) | **80%** |
| 12 SIDs | 192 bytes | 32 bytes (2 contenedores) | **83%** |

!!! tip "6 saltos en 16 bytes"
    Un solo contenedor uSID codifica **hasta 6 instrucciones de segmento** en el mismo espacio que SRv6 clásico usa para **1 solo SID**. Elimina el coste por SID: una ruta de hasta seis instrucciones solo necesita la cabecera IPv6 exterior de 40 bytes, sin SRH. Una VPN MPLS simple sigue siendo más pequeña (8 bytes); consulta [SRv6 vs MPLS](srv6-vs-sr-mpls.md) para ver las cifras.

## uSID vs G-SRv6

Surgieron dos enfoques de compresión, hoy unificados en el **RFC 9800**:

| Aspecto | uSID (NEXT-C-SID) | G-SRv6 (REPLACE-C-SID) |
|---------|:-----------------:|:----------------------:|
| **Origen** | Cisco, Bell Canada | China Mobile, Huawei |
| **Procesamiento** | Desplazar y buscar | Reemplazar y buscar |
| **Tamaño del uSID** | 16 o 32 bits | 16 o 32 bits |
| **RFC** | RFC 9800 | RFC 9800 |
| **Adopción** | Varios operadores globales | Varios operadores globales |

Ambos sabores están estandarizados en el **RFC 9800** (Compressed SRv6 Segment List Encoding). Son codificaciones distintas, así que un dominio usa una de las dos; la interoperabilidad entre fabricantes se ha demostrado para NEXT-C-SID (uSID).

## Ejemplos de configuración

=== "Cisco IOS-XR"

    ```cisco
    segment-routing
     srv6
      locators
       locator uSID-MAIN
        micro-segment behavior unode psp-usd
        prefix fcbb:bbbb:1::/48
       !
      !
     !
    !
    ```

=== "Linux (iproute2)"

    ```bash
    # Encapsular con un contenedor uSID
    ip route add 10.0.0.0/24 encap seg6 mode encap \
      segs fcbb:bbbb:0001:0002:0003:: dev eth0
    ```

## Adopción en la industria

Varios operadores anunciaron públicamente despliegues de SRv6 uSID. El directorio [Real-World Deployments](../use-cases/deployments.md) *(en inglés)* reúne esos anuncios con enlaces a las fuentes originales.

## Para seguir leyendo

- :material-arrow-right: [Estructura del SID](estructura-del-sid.md) — El formato del SID clásico
- :material-arrow-right: [Cabecera SRH](cabecera-srh.md) — Cómo se procesa la SRH
- :material-arrow-right: [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) — Sobrecarga y diferencias frente a MPLS
- :material-arrow-right: [Cisco IOS-XR](../implementations/cisco-ios-xr.md) — Configuración de Locators uSID en IOS-XR *(en inglés)*
- :material-arrow-right: [Labs con netlab](../labs/netlab.md) — Practica uSID en un laboratorio listo *(en inglés)*

## Referencias

1. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://datatracker.ietf.org/doc/rfc9800/) - RFC que define los sabores de compresión NEXT-C-SID y REPLACE-C-SID
2. [draft-filsfils-spring-net-pgm-extension-srv6-usid - SRv6 uSID Instruction](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/) - Draft original del IETF que introdujo el micro-SID (uSID)
3. [Bell Canada SRv6-uSID Deployment (PDF)](https://www.segment-routing.net/images/2023-03-30-srv6-workshop-bell-canada.pdf) - Presentación de Daniel Voyer sobre el despliegue de SRv6 uSID en Bell Canada *(en inglés)*
