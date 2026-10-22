---
title: SRv6 en español
seo_title: "SRv6 en español: guía de Segment Routing sobre IPv6"
description: "Guía abierta de SRv6 en español: qué es Segment Routing sobre IPv6, cómo funcionan los SID, la cabecera SRH y uSID, y en qué se diferencia de MPLS. Gratis y open source."
translation_of: index.md
tags:
  - español
  - srv6
  - qué es srv6
hide:
  - toc
---

<div class="srv6-hero" markdown>

# SRv6: Segment Routing sobre IPv6

<p class="srv6-tagline">
  La base de conocimiento open source de <strong>SRv6</strong>, ahora en español.<br>
  Aprende cómo funciona SRv6, monta laboratorios y contribuye.
</p>

[:material-rocket-launch: &nbsp; Empieza aquí](que-es-srv6.md){ .srv6-btn .srv6-btn-primary }
&nbsp;&nbsp;
[:fontawesome-brands-github: &nbsp; Contribuye](https://github.com/eldaninavas/srv6.md){ .srv6-btn .srv6-btn-secondary }

</div>

## :material-head-question: SRv6 (IPv6 Segment Routing) en pocas palabras

**SRv6 (Segment Routing over IPv6, o Segment Routing sobre IPv6)**, también escrito **Segment Routing v6**, SR v6 o **IPv6 Segment Routing**, es el plano de datos IPv6 de la arquitectura Segment Routing ([RFC 8402](../rfcs/rfc8402.md)). Codifica las instrucciones de reenvío directamente en la cabecera de los paquetes IPv6. En lugar de depender de etiquetas MPLS y de protocolos de señalización como LDP o RSVP-TE, SRv6 usa direcciones IPv6 nativas de 128 bits como **identificadores de segmento (SID)** para programar las rutas y los comportamientos de la red.

El nodo de origen arma una lista ordenada de segmentos que define la ruta del paquete y lo que debe hacer cada nodo. El segmento activo va en la dirección IPv6 de destino; cuando hay más de uno, el resto viaja en una **Segment Routing Header (SRH)**, y con [uSID](usid.md) muchas veces la ruta completa cabe en la dirección de destino sin necesidad de SRH. Los routers de tránsito simplemente reenvían según la dirección de destino. Esto habilita ingeniería de tráfico, servicios VPN, fast reroute y encadenamiento de funciones de servicio sobre una red IPv6 normal.

**¿Por qué SRv6 en lugar de MPLS tradicional?**

- **Operación más simple**: sin gestión de etiquetas MPLS, LDP ni RSVP
- **IPv6 nativo**: usa el plano de datos IPv6 existente, sin overlays
- **Programabilidad de red**: comportamientos definidos con funciones SRv6 (End, End.DT4, End.DX6…)
- **Escalabilidad**: el espacio de SID de 128 bits soporta redes de gran escala
- **Un solo plano de datos**: un único stack para transporte, VPN e ingeniería de tráfico

## :material-book-open-variant: Guías en español

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-help-circle: ¿Qué es SRv6?

Los conceptos básicos: segmentos, SRH, enrutamiento de origen y cómo viaja un paquete SRv6.

[:material-arrow-right: Leer la guía](que-es-srv6.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-identifier: Estructura del SID

Locator, función y argumentos del SID de 128 bits, y el bloque `5f00::/16` de IANA.

[:material-arrow-right: Ver la estructura](estructura-del-sid.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-routes: Cabecera SRH

Recorrido de un paquete nodo por nodo, Segments Left, PSP/USP/USD y H.Encaps.Red.

[:material-arrow-right: Recorrer el paquete](cabecera-srh.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-arrow-collapse-horizontal: uSID

Cómo el micro-SID (RFC 9800) mete hasta 6 instrucciones en una sola dirección IPv6.

[:material-arrow-right: Entender uSID](usid.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-compare: SRv6 vs SR-MPLS

Diferencias en plano de datos, sobrecarga y programabilidad, y cuándo conviene cada uno.

[:material-arrow-right: Comparar](srv6-vs-sr-mpls.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-chip: SRv6 para IA

Cómo OpenAI, Microsoft y Oracle usan MRC sobre SRv6 uSID estático en sus fabrics de GPU, y el scale-across de Meta y Alibaba.

[:material-arrow-right: SRv6 en redes de IA](ia.md){ .md-button }

</div>

</div>

## :material-chart-bar: State of SRv6 2026

¿Cuánto ha avanzado SRv6? Nuestro informe de datos cuenta 23 RFC de SRv6, 65 borradores activos en el IETF, 19 organizaciones con despliegues públicos y el soporte de uSID en 11 implementaciones. Cada cifra tiene su fuente y las gráficas se pueden reutilizar. El informe está en inglés.

[:material-arrow-right: Leer el informe State of SRv6 2026](../reports/state-of-srv6-2026.md){ .md-button .md-button--primary }

## :material-compass: El resto del sitio (en inglés)

El contenido completo de SRv6.md está en inglés y lo vamos traduciendo poco a poco:

- :material-traffic-light: [Use Cases](../use-cases/index.md) — Ingeniería de tráfico, VPN, 5G, redes de IA, satélite y más
- :material-server-network: [Implementations](../implementations/index.md) — Configuración en Cisco IOS-XR e IOS-XE, Juniper, Arista, Nokia, FRR, Linux y SONiC
- :material-flask: [Labs](../labs/index.md) — Laboratorios gratuitos con netlab, Containerlab y GNS3
- :material-file-document: [RFCs & Standards](../rfcs/index.md) — Todos los RFC de SRv6 explicados
- :material-graph: [Knowledge Graph](../knowledge-graph.md) — Mapa interactivo de todos los conceptos

!!! tip "Proyecto comunitario"
    SRv6.md lo construye y mantiene la comunidad de redes. ¿Quieres ayudar a traducir una página o corregir algo? Cada página tiene un botón de edición (:material-pencil:) y las contribuciones son bienvenidas.
