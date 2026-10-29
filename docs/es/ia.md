---
title: SRv6 para IA
seo_title: "SRv6 para IA: guía completa de SRv6 en redes de IA"
description: "SRv6 para IA en español: quién lo usa (OpenAI, Microsoft, Oracle, Meta, Alibaba, Google), cómo funcionan MRC y el enrutamiento de origen con uSID en fabrics de GPU, scale-across, estándares y preguntas frecuentes."
translation_of: ai/index.md
tags:
  - español
  - ai
  - gpu
  - mrc
  - usid
  - srv6 ia
---

# SRv6 para IA: la guía completa

**SRv6 se ha convertido en una tecnología fundamental para las redes de IA.** En los fabrics de entrenamiento de GPU, la NIC emisora escribe la ruta exacta de cada paquete como una lista de uSID de 16 bits en la dirección IPv6 de destino. Los switches lo reenvían con tablas estáticas y sin ningún protocolo de enrutamiento, y el transporte reparte (*spraying*) el tráfico entre cientos de rutas explícitas y abandona una ruta que falla en microsegundos. Entre centros de datos, la ingeniería de tráfico SRv6 dirige el tráfico de IA a través de la WAN. OpenAI, Microsoft y Oracle usan SRv6 en sus fabrics de entrenamiento de IA, Meta en el backbone que interconecta sus clústeres de IA y Alibaba Cloud en toda su red de cómputo para IA.

!!! abstract "Datos clave (octubre de 2026)"
    - **En producción**: [MRC](../ai/mrc.md) *(en inglés)* sobre SRv6 estático entrena modelos de frontera en los mayores clústeres GB200 de OpenAI, en las supercomputadoras Fairwater de Microsoft y en los clústeres OCI de Oracle, incluido el de Abilene, Texas. Los trabajos reportados llegan a 75.000 GPU en fabrics diseñados para 131.072 GPU en dos niveles.
    - **Sin BGP en el backend**: los switches mantienen pequeñas tablas uSID estáticas que se escriben una sola vez durante la instalación. El manejo de fallos pasa a la NIC.
    - **40 bytes**: con uSID, una ruta completa cabe en una sola dirección IPv6 de destino, sin Segment Routing Header.
    - **Scale-across**: Meta (backbone regional, primer sitio con SRv6 TE en producción en octubre de 2026) y Alibaba (un "eCore for AI" dedicado con SRv6 TE por trabajo de entrenamiento) usan SRv6 entre sitios de IA.
    - **Estándares**: plano de datos en RFC 8986 y RFC 9800; uso en IA en [draft-filsfils-srv6ops-srv6-ai-backend](../ai/ai-standards.md) *(en inglés)* (-05, con autores de Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA y Arrcus); transporte en OCP MRC 1.0; software de switch en SONiC desde la versión 202505.

## Por qué SRv6 encaja en las redes de IA

1. **Rutas deterministas, no hashing.** El entrenamiento de IA son unos pocos flujos enormes y sincronizados, el peor caso posible para ECMP. Con SRv6 el emisor coloca cada paquete en una ruta conocida, así que no hay colisiones de hash y los cambios de ruta son exactos. Ver [SRv6 vs ECMP, Adaptive Routing y Ultra Ethernet](../ai/srv6-vs-ai-fabric-alternatives.md) *(en inglés)*.
2. **Un fabric estático y más simple.** Las rutas uSID estáticas reemplazan a BGP y su reconvergencia. Los operadores de MRC reinician switches spine sin coordinarlo con los equipos de entrenamiento.
3. **Visibilidad real.** Una sonda que usa la misma ruta uSID que los datos prueba exactamente lo que experimentan los datos. Clustermapper, de OpenAI, sondea cada enlace cada milisegundo. Ver [AI Fabric Telemetry](../ai/ai-fabric-telemetry.md) *(en inglés)*.
4. **Sobrecarga mínima.** uSID ([RFC 9800](../rfcs/rfc9800.md)) empaqueta hasta seis saltos en una sola dirección de 128 bits. El costo es una única cabecera IPv6 externa de 40 bytes, que los ASIC de switch convencionales procesan a velocidad de línea.
5. **Una sola tecnología de la GPU a la WAN.** El mismo plano de datos SRv6 sirve al fabric de backend, al frontend del centro de datos y al backbone entre centros de datos, sin gateways MPLS en el borde del DC. Ver [Scale-Across](../ai/scale-across.md) *(en inglés)*.
6. **Abierto y multivendor.** NIC de NVIDIA, AMD y Broadcom; switches de NVIDIA, Arista (sobre Broadcom) y Cisco Silicon One; y SONiC, SAI y FRR de código abierto.

## Quién usa SRv6 para IA

| Organización | Dónde corre SRv6 | Qué hace | Estado | Fuente |
|--------------|------------------|----------|--------|--------|
| **OpenAI** | Fabric de backend de GPU | MRC sobre enrutamiento de origen uSID estático; sin enrutamiento dinámico; sondeo con Clustermapper | En producción (mayores clústeres GB200) | [Paper de MRC](https://arxiv.org/abs/2605.04333) |
| **Microsoft** | Supercomputadoras de IA Fairwater | SRv6 estático reemplaza a BGP en la red scale-out; contribuciones de SRv6 a SONiC | En producción | [Blog de Azure HPC](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) |
| **Oracle (OCI)** | Red multiplano Acceleron, incluido Abilene, Texas | MRC con enrutamiento de origen SRv6 | En producción (según el draft del IETF) | [draft -05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) |
| **Meta** | Backbone regional que interconecta campus de DC y clústeres de IA | Ingeniería de tráfico uSID desde un controlador central sobre FBOSS + Cisco Silicon One | Primer sitio con SRv6 TE en producción, oct. 2026 | [Meta Engineering](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) |
| **Alibaba Cloud** | Red de cómputo para IA y backbone scale-across "eCore for AI" | IPv6/SRv6 en más de 14 clústeres de IA (90.000 servidores); SRv6 TE por trabajo de entrenamiento entre sitios | En producción | [IETF 125](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02), [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-alibaba-cisco-te/) |
| **Google** | Fabric de IA Virgo | Enrutamiento de origen SRv6 para clientes bare-metal que ejecutan su propio stack de host | Ofrecido en el fabric | [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) |
| **Nebius** | DC y WAN de nube de GPU | VPN y TE SRv6 de extremo a extremo sin traducción de protocolos entre DC y WAN | En producción | [@Scale 2026](https://www.segment-routing.net/conferences/2026-08-25-atscale-nebius-srv6-interconnects/) |
| **China Telecom** | Red metropolitana de potencia de cómputo | L3EVPN sobre SRv6 Policy para entrenamiento entre clústeres a 100–500 km | Pruebas en red comercial | [White paper](https://www.gfnds.com/uploads/20250818/59e55fd7289db89d0a8e02ccd676ae87.pdf) |

Para despliegues de SRv6 fuera de la IA, ver [Real-World Deployments](../use-cases/deployments.md) *(en inglés)*.

## Cronología

| Fecha | Hito |
|-------|------|
| Abr. 2025 | Primer draft del IETF sobre SRv6 para backends de IA (Cisco) |
| 2025 | SONiC 202505 incorpora configuración SRv6 estática para backends de IA con enrutamiento de origen |
| Jun. 2025 | Se publica Ultra Ethernet 1.0 (spraying basado en entropía; sin SRv6) |
| Ene. 2026 | Position paper de Microsoft Research sobre direccionamiento de paquetes con SRv6 en backends de IA |
| Feb. 2026 | NANOG 96: Cisco y Microsoft sobre el despliegue de SRv6 uSID y SONiC en backends de IA |
| Mar. 2026 | IETF 125: Alibaba informa que su cómputo de IA se basa íntegramente en IPv6/SRv6 |
| **5 may. 2026** | **OpenAI y sus socios publican MRC y su diseño de SRv6 estático; se lanza OCP MRC 1.0** |
| Jul. 2026 | IETF 126: los autores del draft de backends de IA solicitan su adopción por el grupo de trabajo |
| Sep. 2026 | draft-filsfils-srv6ops-srv6-ai-backend-05 (Cisco, OpenAI, Microsoft, Oracle, IBM, NVIDIA, Arrcus) |
| Oct. 2026 | OCP Global Summit: Clustermapper de OpenAI, backbone SRv6 de Meta en producción, TE por trabajo de Alibaba, Virgo de Google |

## Explora la sección SRv6 para IA (en inglés)

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-lan-connect: MRC y SRv6

Cómo las redes de las supercomputadoras de OpenAI y Microsoft usan enrutamiento de origen uSID estático, Clos multiplano y packet spraying.

[:material-arrow-right: Leer el análisis (en inglés)](../ai/mrc.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-floor-plan: Diseño de fabrics de IA

Topología, plan de direccionamiento uSID, tablas estáticas en los switches, configuración de SONiC y FRR, lado de la NIC, hardware y seguridad.

[:material-arrow-right: Diseñar un fabric (en inglés)](../ai/ai-fabric-design.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-compare: SRv6 frente a las alternativas

ECMP, flowlets, adaptive routing, InfiniBand y Ultra Ethernet, y cómo SRv6 los complementa.

[:material-arrow-right: Comparar (en inglés)](../ai/srv6-vs-ai-fabric-alternatives.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-earth: Scale-Across

IA en varios centros de datos: el backbone SRv6 de Meta, el eCore for AI de Alibaba, China Telecom y lo que no es SRv6.

[:material-arrow-right: Más allá de un sitio (en inglés)](../ai/scale-across.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-radar: Telemetría de fabrics de IA

Sondeo con enrutamiento de origen, Clustermapper y cómo encontrar fallos grises en fabrics de GPU.

[:material-arrow-right: Observar el fabric (en inglés)](../ai/ai-fabric-telemetry.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-file-document-multiple: Seguimiento de estándares

Drafts del IETF, OCP MRC, Ultra Ethernet y el estado de SONiC/SAI/FRR en una sola tabla.

[:material-arrow-right: Seguir los estándares (en inglés)](../ai/ai-standards.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-book-alphabet: Glosario de redes de IA

All-reduce, RoCEv2, packet spraying, multiplano, valor de entropía, uN: definidos para ingenieros de redes.

[:material-arrow-right: Buscar un término (en inglés)](../ai/ai-glossary.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-chip: Redes de entrenamiento de IA/ML

El caso de uso en breve: por qué ECMP falla en el entrenamiento con GPU y cómo lo resuelve la colocación de rutas con SRv6.

[:material-arrow-right: Leer el caso de uso (en inglés)](../use-cases/ai-networking.md){ .md-button }

</div>

</div>

## Preguntas frecuentes

### ¿Para qué se usa SRv6 en las redes de IA?

SRv6 se usa en las redes de IA para dos cosas. Dentro de un clúster de entrenamiento de GPU, la NIC usa uSID de SRv6 para elegir la ruta exacta de cada paquete a través del fabric de backend, lo que elimina las colisiones de hash de ECMP, permite que los switches funcionen sin enrutamiento dinámico y hace que cada ruta se pueda probar. Entre centros de datos, la ingeniería de tráfico SRv6 dirige el tráfico de IA por rutas con la latencia y la capacidad adecuadas.

### ¿OpenAI usa SRv6?

Sí. Los mayores clústeres de entrenamiento GB200 de OpenAI usan MRC (Multipath Reliable Connection) sobre enrutamiento de origen SRv6 uSID estático, con el enrutamiento dinámico desactivado en los switches. OpenAI, Microsoft, AMD, Broadcom y NVIDIA describieron el diseño en mayo de 2026, y OpenAI presentó su sistema de monitoreo Clustermapper, basado en SRv6, en el OCP Global Summit de octubre de 2026.

### ¿Por qué SRv6 es bueno para el entrenamiento de IA?

El entrenamiento de IA envía unos pocos flujos muy grandes y sincronizados, así que el hashing por flujo genera colisiones y la ruta más lenta frena todo el trabajo. SRv6 permite que el emisor coloque cada paquete en una ruta explícita, lo reparta entre cientos de rutas y abandone una ruta que falla en microsegundos. Los switches siguen siendo estáticos y simples, y uSID limita la sobrecarga a una sola cabecera IPv6 de 40 bytes.

### ¿Cuál es la diferencia entre SRv6 y Ultra Ethernet?

Ultra Ethernet define un transporte que reparte los paquetes usando valores de entropía que los switches procesan con hash, sin cambiar la capa de red. SRv6 es una tecnología de enrutamiento de origen en la capa de red que puede asignar cada valor de entropía a una ruta explícita. Son complementarios: MRC combina funciones de transporte derivadas de Ultra Ethernet con el enrutamiento de origen de SRv6.

### ¿Qué switches soportan SRv6 para fabrics de IA?

Los despliegues publicados usan NVIDIA Spectrum-4 y Spectrum-5 (con Cumulus o SONiC), Arista EOS sobre Broadcom Tomahawk 5 y sistemas Cisco Silicon One con SONiC. SONiC soporta la configuración estática de SRv6 uSID desde la versión 202505.

### ¿Se usa SRv6 entre centros de datos de IA?

Sí. Meta usa ingeniería de tráfico SRv6 en el backbone regional que interconecta sus campus de centros de datos y sus clústeres de IA, y Alibaba Cloud opera una red SRv6 dedicada al entrenamiento de IA en varios sitios, con ingeniería de tráfico por trabajo.

## Referencias

1. [Resilient AI Supercomputer Networking using MRC and SRv6](https://arxiv.org/abs/2605.04333) - OpenAI, Microsoft, AMD, Broadcom y NVIDIA, mayo de 2026 *(en inglés)*
2. [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) - SRv6 for Deterministic Path Placement in AI Backends *(en inglés)*
3. [OCP MRC 1.0 Specification](https://www.opencompute.org/documents/ocp-mrc-1-0-pdf) - Multipath Reliable Connection *(en inglés)*
4. [Building resilient networks for AI supercomputers](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) - Blog de Microsoft Azure HPC *(en inglés)*
5. [OCP Summit 2026: Powering AI with open innovations in scale-up, scale-out and scale-across networks](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) - Meta Engineering *(en inglés)*
6. [IPv6 & SRv6 Powering Alibaba Cloud AI Computing (IETF 125)](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02) - Alibaba Cloud *(en inglés)*
7. [SONiC 202505: Powering AI fabrics](https://sonicfoundation.dev/sonic-202505-powering-ai-fabrics-and-enterprise-networks-with-precision-and-insight/) - SONiC Foundation *(en inglés)*
