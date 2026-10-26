---
title: SRv6 vs MPLS
og_image: assets/images/srv6-vs-mpls-overhead.png
seo_title: "SRv6 vs MPLS y SR-MPLS: diferencias, overhead y cuándo usar cada uno"
description: "SRv6 vs MPLS: comparación de MPLS clásico (LDP, RSVP-TE), SR-MPLS y SRv6. Overhead con números reales, hardware, seguridad, operación y cuándo elegir cada uno."
translation_of: topics/srv6-vs-sr-mpls.md
tags:
  - español
  - comparación
  - mpls
  - srv6 vs mpls
---

# SRv6 vs MPLS y SR-MPLS

**SRv6 y MPLS resuelven el mismo problema, dirigir el tráfico y transportar VPN a través de la red de un proveedor, con planos de datos distintos.** MPLS reenvía según etiquetas (*labels*) y necesita sus propios protocolos de control (LDP, RSVP-TE) o Segment Routing (SR-MPLS). SRv6 reenvía según direcciones IPv6 comunes y no necesita ninguno de los dos. Esta página compara los tres: MPLS clásico, SR-MPLS y SRv6, con los números reales detrás de los argumentos de siempre.

!!! abstract "La respuesta corta"
    - **Pasar de MPLS clásico a SR-MPLS** elimina LDP y RSVP-TE, pero mantiene el plano de datos MPLS. Es el paso de menor riesgo para redes con hardware MPLS en todas partes.
    - **SRv6** elimina también el plano de datos MPLS. Una sola cabecera IPv6 lleva la ruta, la VPN y el servicio, desde la WAN hasta los centros de datos, las nubes y los hosts.
    - **El overhead es el principal punto en contra:** una VPN típica sobre SR-MPLS agrega 8 bytes; una VPN SRv6 con uSID agrega 40. En paquetes de 1500 bytes, eso es 0.5% frente a 2.7%.
    - **La mayoría de los operadores que adoptan SRv6 hoy van directo a SRv6 con uSID** cuando su hardware lo soporta, y usan SR-MPLS donde no. Ver [Migración](../topics/interworking-migration.md) *(en inglés)*.

## Las tres generaciones

| | MPLS clásico | SR-MPLS | SRv6 |
|--|-------------|---------|------|
| Plano de datos | Etiquetas MPLS | Etiquetas MPLS | IPv6 |
| Distribución de etiquetas / SID | LDP, RSVP-TE | IGP (IS-IS, OSPF) o BGP | IGP o BGP (los locators son prefijos IPv6) |
| Ingeniería de tráfico | RSVP-TE: estado por túnel en cada router de tránsito | SR Policy: estado solo en el headend | SR Policy y Flex-Algo: estado solo en el headend |
| Protección rápida (*fast reroute*) | FRR de RSVP-TE, LFA (cobertura parcial) | TI-LFA (cobertura completa) | TI-LFA (cobertura completa) |
| Identificador de segmento | — | Etiqueta de 20 bits (índice global en el SRGB, o local) | Dirección IPv6 de 128 bits (locator : función : argumento) |
| Servicios | L3VPN, L2VPN, EVPN | Los mismos | Los mismos, señalizados con SID SRv6 ([RFC 9252](../rfcs/rfc9252.md)) |
| Estándares | RFC 3031, LDP RFC 5036, RSVP-TE RFC 3209 | RFC 8402, RFC 8660, extensiones de IGP RFC 8665/8667 | [RFC 8754](../rfcs/rfc8754.md), [RFC 8986](../rfcs/rfc8986.md), [RFC 9800](../rfcs/rfc9800.md) |

Segment Routing ([RFC 8402](../rfcs/rfc8402.md)) es una sola arquitectura con dos planos de datos. SR-MPLS y SRv6 comparten las mismas ideas: enrutamiento en origen, segmentos de prefijo y de adyacencia, TI-LFA, SR Policy y Flex-Algo. Lo que cambia es cómo se codifica un segmento en el paquete.

## Cómo cambia el paquete

<figure markdown="span">
  ![Overhead de cabecera de SRv6 vs MPLS en un paquete de VPN de capa 3: MPLS o SR-MPLS agrega dos etiquetas de 4 bytes (8 bytes), SRv6 con uSID agrega una cabecera IPv6 exterior de 40 bytes y SRv6 con Segment Routing Header agrega 40 + 8 + 16 bytes por cada SID adicional.](../assets/images/srv6-vs-mpls-overhead.png){ width="1200" height="630" loading="lazy" }
  <figcaption>SRv6 vs MPLS: lo que cada encapsulación agrega a un paquete de VPN</figcaption>
</figure>

Un paquete de VPN de capa 3 que cruza el núcleo, sin ingeniería de tráfico:

```
MPLS clásico / SR-MPLS          +8 bytes
[ Ethernet ][ etiqueta de transporte | etiqueta VPN ][ paquete IP del cliente ]
              4 bytes                  4 bytes

SRv6 con uSID (sin SRH)         +40 bytes
[ Ethernet ][ IPv6 exterior, DA = 5f00:0:0100:e004:: ][ paquete IP del cliente ]
              40 bytes: uSID de nodo + uSID de VPN en una sola dirección

SRv6 con SRH                    +40 + 8 + 16 × n bytes
[ Ethernet ][ IPv6 exterior ][ SRH: n SID adicionales ][ paquete IP del cliente ]
```

Con ingeniería de tráfico la brecha se achica. Cada segmento adicional de SR-MPLS agrega otra etiqueta de 4 bytes, mientras que SRv6 con uSID empaqueta hasta seis instrucciones en la misma dirección de destino de 128 bits. El PE de salida usa dos de ellas (su uSID de nodo y el uSID de la VPN), así que una ruta de TE con cuatro puntos de paso (*waypoints*) y un servicio VPN sigue costando 40 bytes. Solo las rutas más largas necesitan una SRH, que agrega 8 bytes más 16 por cada seis instrucciones adicionales.

| Caso | SR-MPLS | SRv6 uSID |
|------|:-------:|:---------:|
| VPN, ruta más corta | 8 B | 40 B |
| VPN + 3 waypoints de TE | 20 B | 40 B |
| VPN + 4 waypoints de TE | 24 B | 40 B |
| VPN + 5 waypoints de TE | 28 B | 64 B (un contenedor en la SRH) |
| VPN + 10 waypoints de TE | 48 B | 64 B (sigue siendo un contenedor en la SRH) |

En la práctica: sube la MTU del núcleo (la mayoría de los núcleos ya trabajan con 9000 o más) y el overhead desaparece para cualquier tamaño de paquete que realmente reenvíes. Las cargas con paquetes pequeños (voz, juegos en línea) son las que más sienten la diferencia, como proporción del ancho de banda. La [página de uSID](usid.md) tiene la comparación completa de overhead, y el [decodificador de SID](../tools/sid-decoder.md) *(en inglés)* muestra cómo caben seis uSID en una sola dirección.

## Dónde se diferencian de verdad

### Plano de control

MPLS clásico necesita dos o tres protocolos además del IGP: LDP para las etiquetas, RSVP-TE para las rutas con ingeniería de tráfico y la sincronización entre ellos (LDP-IGP sync, refresco de RSVP-TE, túneles de bypass para FRR). Tanto SR-MPLS como SRv6 eliminan todo eso: el IGP anuncia los segmentos, BGP señaliza los servicios y, de forma opcional, un PCE calcula las rutas explícitas.

**SR-MPLS conserva una pieza de estado MPLS:** un bloque de etiquetas (el SRGB) que debe ser consistente en todo el dominio, más la asignación de etiquetas para adyacencias y servicios. **SRv6 reemplaza las etiquetas por direcciones:** cada nodo es dueño de un prefijo locator, y los SID son enrutables dentro de él. No hay un bloque de etiquetas que coordinar, y el núcleo puede sumarizar los locators como cualquier otro prefijo IPv6.

### Alcance más allá del núcleo MPLS

Para muchas redes, este es el factor decisivo. MPLS solo funciona donde cada salto reenvía MPLS. Las nubes públicas, la mayoría de los fabrics de centros de datos e Internet no lo hacen, así que los servicios MPLS terminan en el borde y necesitan gateways o costuras con GRE o VXLAN para ir más lejos.

SRv6 funciona sobre cualquier red IPv6. Los routers de tránsito reenvían según la dirección de destino y no necesitan entender SRv6; solo lo necesitan los nodos que ejecutan un SID. Así es como SRv6 llega a [backbones de nube](../use-cases/cloud-native-backbone.md), [hosts de Kubernetes](../topics/host-based-srv6.md) y [fabrics de GPU para IA](ia.md), adonde MPLS nunca llegó.

### Programación de red

Una etiqueta MPLS significa "reenvía hacia aquí" o "esta es la VPN X". Un SID SRv6 además puede llevar una función y argumentos. [RFC 8986](../rfcs/rfc8986.md) define comportamientos de desencapsular y buscar en tabla, de conexión cruzada (*cross-connect*) y de asociación a una política (*binding*), y RFC posteriores agregan el [plano de usuario móvil](../rfcs/rfc9433.md), la [replicación multicast](../rfcs/rfc9524.md) y la [señalización de argumentos](../rfcs/rfc9819.md). En la práctica, la mayoría de las redes usan el mismo puñado de comportamientos en ambos mundos; la diferencia se nota en móvil, encadenamiento de servicios (*service chaining*) y casos de uso basados en hosts.

### Balanceo de carga

Los routers de tránsito MPLS calculan el hash sobre la pila de etiquetas, así que necesitan una etiqueta de entropía ([RFC 6790](https://www.rfc-editor.org/rfc/rfc6790)) o inspección profunda del paquete para repartir los flujos. En SRv6, el headend fija el flow label de IPv6 a partir del flujo interno, y cada router de tránsito calcula el hash sobre la cabecera IPv6 exterior, algo que ya hace con cualquier tráfico IPv6.

### Interdominio

Las VPN MPLS entre dominios necesitan las opciones inter-AS A, B o C y empalmar etiquetas en los bordes. Los SID SRv6 son prefijos IPv6: se anuncia o se sumariza el locator hacia el otro dominio y la ruta de extremo a extremo funciona, con binding SID donde se quiera ocultar la topología de un dominio al otro. Ver [Inter-Domain SRv6](../topics/inter-domain.md) *(en inglés)*.

### Seguridad

Un núcleo MPLS está aislado por construcción: las etiquetas no son enrutables desde afuera, así que los paquetes externos no pueden llegar al reenvío MPLS. Los SID SRv6 son direcciones IPv6, así que ese mismo aislamiento hay que construirlo: filtrar el bloque de SID (idealmente `5f00::/16`, [RFC 9602](../rfcs/rfc9602.md)) y los paquetes con SRH en cada interfaz externa ([RFC 8754, sección 5](../rfcs/rfc8754.md)). Es un único filtro bien definido, pero no es opcional. Ver [Security](../topics/security.md) *(en inglés)*.

### Operación

MPLS tiene LSP ping y traceroute ([RFC 8029](https://www.rfc-editor.org/rfc/rfc8029)) y décadas de herramientas y procedimientos operativos (*runbooks*). SRv6 usa ping y traceroute IPv6 estándar hacia los SID, más las extensiones de OAM de [RFC 9259](../rfcs/rfc9259.md), y Wireshark decodifica la SRH de forma nativa ([capturas de paquetes](../labs/pcaps.md), en inglés). A los equipos que ya dominan IPv6 les resulta más fácil leer SRv6; los equipos con runbooks MPLS muy elaborados tienen que reentrenarse.

### Hardware y madurez

El reenvío MPLS está en todos los routers de proveedor de servicios fabricados en los últimos veinte años. SRv6, y en especial uSID, necesita silicio más nuevo: las NPU actuales y los chips de switching comerciales (*merchant silicon*) manejan uSID a velocidad de línea, mientras que las tarjetas de línea más antiguas pueden soportar solo SR-MPLS o SRv6 sin comprimir con un límite bajo de SID. Revisa la [matriz de soporte](../implementations/support-matrix.md) *(en inglés)* y la profundidad de push de cada plataforma antes de comprometerte. SR-MPLS es hoy la variante de SR más desplegada; SRv6 es la que crece más rápido, con [19 organizaciones](../reports/state-of-srv6-2026.md#deployments-19-organizations) que documentan su uso en producción, desde SoftBank y Rakuten Mobile hasta Microsoft, Meta y Alibaba Cloud.

## Cuándo elegir cada uno

!!! tip "Quédate en MPLS clásico (por ahora) cuando"
    - La red es estable, RSVP-TE hace lo que necesitas y nada obliga a cambiar.
    - Aun así, planifica el paso a Segment Routing: LDP y RSVP-TE son donde los fabricantes menos invierten.

!!! tip "Elige SR-MPLS cuando"
    - Tus routers reenvían MPLS pero no pueden hacer SRv6 (o uSID) a velocidad de línea.
    - Quieres TI-LFA y SR Policy ya, sin cambiar el plano de datos.
    - El overhead por paquete importa más que el alcance fuera del núcleo.

!!! tip "Elige SRv6 cuando"
    - Estás construyendo una red nueva o renovando hardware.
    - Los servicios tienen que llegar a centros de datos, nubes u hosts que no corren MPLS.
    - Quieres una sola encapsulación desde el acceso hasta el fabric de IA, sin gateways en el medio.
    - Tu equipo de todos modos está pasando a una operación solo IPv6.

Muchos operadores corren ambos durante la transición: SR-MPLS en las partes de la red que todavía no pueden hacer SRv6, SRv6 en todas las demás, con gateways de interworking o binding SID entre ellas. La [guía de migración](../topics/interworking-migration.md) *(en inglés)* cubre estrategias greenfield, ship-in-the-night y por fases, con ejemplos reales.

## Preguntas frecuentes

### ¿SRv6 es mejor que MPLS?

Ninguno es mejor en todos los casos. SRv6 elimina protocolos (LDP, RSVP-TE y el propio plano de datos MPLS) y llega a nubes, centros de datos y hosts a los que MPLS no llega. MPLS y SR-MPLS tienen menos overhead por paquete y funcionan en hardware más antiguo. Para redes nuevas y renovaciones de hardware, la mayoría de los operadores hoy eligen SRv6 con uSID.

### ¿SRv6 va a reemplazar a MPLS?

Gradualmente, en muchas redes. LDP y RSVP-TE se están reemplazando por Segment Routing y, entre los despliegues de Segment Routing, SRv6 es el que crece más rápido, sobre todo en transporte 5G, backbones de nube y redes de IA. MPLS seguirá en las redes instaladas durante años, y SR-MPLS sigue siendo una opción sólida donde el hardware no puede hacer SRv6.

### ¿Cuál es la diferencia entre SRv6 y SR-MPLS?

Ambos implementan la misma arquitectura de Segment Routing (RFC 8402). SR-MPLS codifica los segmentos como etiquetas MPLS de 20 bits; SRv6 los codifica como direcciones IPv6 de 128 bits que además llevan una función y argumentos. SRv6 no necesita un bloque de etiquetas y funciona sobre cualquier red IPv6, mientras que SR-MPLS tiene cabeceras más pequeñas.

### ¿Cuánto overhead agrega SRv6 en comparación con MPLS?

Una VPN típica sobre SR-MPLS agrega 8 bytes (dos etiquetas). Una VPN SRv6 con uSID agrega 40 bytes (una cabecera IPv6 exterior) y mantiene ese tamaño en rutas de hasta cuatro waypoints de ingeniería de tráfico. Las rutas más largas agregan una Segment Routing Header: 8 bytes más 16 bytes por cada seis instrucciones adicionales. SRv6 clásico, sin compresión, agrega 16 bytes por SID.

### ¿Pueden SRv6 y MPLS convivir en la misma red?

Sí. Los despliegues ship-in-the-night corren servicios SRv6 en paralelo con MPLS y migran las VRF de a una, y los gateways de interworking o los binding SID conectan dominios SR-MPLS y SRv6 de extremo a extremo. Ver la [guía de migración](../topics/interworking-migration.md) *(en inglés)*.

## Para seguir leyendo

- :material-arrow-right: [¿Qué es SRv6?](que-es-srv6.md) - La introducción completa
- :material-arrow-right: [MPLS to SRv6 Migration](../topics/interworking-migration.md) - Estrategias, interworking y un despliegue por fases *(en inglés)*
- :material-arrow-right: [uSID](usid.md) - Por qué el overhead de SRv6 ya no es un problema
- :material-arrow-right: [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md) - Decisiones de diseño y migración para arquitectos *(en inglés)*
- :material-arrow-right: [Real-World Deployments](../use-cases/deployments.md) - Quién usa SRv6 en producción *(en inglés)*

## Referencias

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - Una sola arquitectura para los planos de datos MPLS e IPv6
2. [RFC 8660 - Segment Routing with the MPLS Data Plane](https://www.rfc-editor.org/rfc/rfc8660) - Reenvío de SR-MPLS y codificación de etiquetas
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://www.rfc-editor.org/rfc/rfc8754) - La cabecera de extensión de SRv6 y su modelo de seguridad
4. [RFC 8986 - SRv6 Network Programming](https://www.rfc-editor.org/rfc/rfc8986) - Comportamientos de endpoint y de headend de SRv6
5. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://www.rfc-editor.org/rfc/rfc9800) - uSID (NEXT-C-SID) y REPLACE-C-SID
6. [RFC 5036 - LDP Specification](https://www.rfc-editor.org/rfc/rfc5036) y [RFC 3209 - RSVP-TE](https://www.rfc-editor.org/rfc/rfc3209) - El plano de control de MPLS clásico
7. [RFC 6790 - The Use of Entropy Labels in MPLS Forwarding](https://www.rfc-editor.org/rfc/rfc6790) - Balanceo de carga en núcleos MPLS
8. [Cisco Segment Routing Overview and Migration Guidelines](https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/mpls/215215-segment-routing-overview-and-migration-g.html) - Visión práctica de la migración de LDP/RSVP-TE a SR *(en inglés)*
