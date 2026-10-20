---
title: SRv6とは
seo_title: "SRv6とは？仕組みとメリットをわかりやすく解説"
description: "SRv6（Segment Routing over IPv6）とは何か、その仕組みとメリットを解説。SID、SRH、ソースルーティング、ネットワークプログラミング、MPLSとの違いまで順を追って説明します。"
translation_of: topics/what-is-srv6.md
tags:
  - 日本語
  - srv6
  - srv6とは
---

# SRv6とは

**SRv6（Segment Routing over IPv6）**は、IPv6のデータプレーンを使ってソースルーティングとネットワークプログラミングを実現するネットワークアーキテクチャです。**IPv6 Segment Routing**や**Segment Routing v6**と呼ばれることもありますが、いずれも同じIETFの技術を指しています。

## IPv6 Segment Routing、Segment Routing v6、SRv6は同じ技術

Segment Routing（[RFC 8402](../rfcs/rfc8402.md)）は、2つのデータプレーンを持つソースルーティングのアーキテクチャです。

| 目にする名称 | 意味 |
|--------------|------|
| **SRv6**、Segment Routing over IPv6、IPv6 Segment Routing、Segment Routing v6、SR v6 | セグメントはIPv6アドレス。セグメントのリストは宛先アドレスと、必要に応じてSegment Routing Header（[RFC 8754](../rfcs/rfc8754.md)）で運ばれる |
| **SR-MPLS**、Segment Routing MPLS | セグメントはラベルスタック上のMPLSラベル（[RFC 8660](https://www.rfc-editor.org/rfc/rfc8660)） |

「Segment Routing v6」の「v6」はデータプレーンのIPバージョンを表しており、Segment Routingの第6版という意味ではありません。IS-IS/OSPFv3の拡張、[Flex-Algo](../topics/flex-algorithm.md)、[TI-LFA](../topics/ti-lfa.md)、[SR Policy](../topics/sr-policy.md)といったコントロールプレーンの機能は両者で共通です。そのため、ベンダーのドキュメントでは両方が1つの「Segment Routing」ガイドにまとめられていることがよくあります。両者の比較は[SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md)を参照してください。

## 概要

SRv6は、**セグメント**と呼ばれる命令のリストをIPv6パケットのヘッダーに格納します。各セグメントは128ビットのIPv6アドレスで、ネットワーク上の特定の命令やビヘイビア（振る舞い）を表します。

```mermaid
graph LR
    A[送信元] -->|SRv6パス| B[ノード1]
    B -->|Segment List| C[ノード2]
    C -->|End.DT4| D[宛先]
```

## 主要な概念

### セグメント
**セグメント**は、次の情報をエンコードしたIPv6アドレスです。

- **Locator**：ネットワーク内のノードを識別する
- **Function**：適用するビヘイビアを指定する
- **Arguments**：Functionに渡すオプションのパラメータ

### Segment Routing Header（SRH）
SRHはIPv6の拡張ヘッダー（Routing Header、Routing Type 4）で、順序付けされたセグメントのリストを運びます。

```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Next Header  |  Hdr Ext Len  | Routing Type  | Segments Left |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Last Entry   |    Flags      |              Tag              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|            Segment List[0] (128-bit IPv6 address)             |
|                                                               |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                                                               |
|            Segment List[1] (128-bit IPv6 address)             |
|                                                               |
|                                                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                            ...                                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### ソースルーティング

SRv6では、**送信元ノード**（Ingress）がセグメントリストを設定することで、ネットワーク内の経路全体を決定します。途中のノードはアクティブなセグメントを処理してパケットを転送するだけです。

## SRv6のメリット

| 特長 | 説明 |
|------|------|
| :material-ip-network: **ネイティブIPv6** | オーバーレイプロトコルが不要で、IPv6をそのまま使える |
| :material-code-tags: **プログラマビリティ** | SRv6のFunctionでネットワークの振る舞いを定義できる |
| :material-cog: **シンプル化** | MPLSのシグナリングプロトコル（LDP、RSVP）が不要になる |
| :material-chart-line: **スケーラビリティ** | 128ビットのSID空間で大規模なネットワークに対応できる |
| :material-shield-check: **セキュリティ** | SRHのHMAC TLVによる認証をサポート |

## SRv6の仕組み（簡略版）

1. **Ingressノード**がパケットを受信し、適用するSRv6ポリシーを決定する
2. 外側のIPv6ヘッダーとSRHでパケットをカプセル化する
3. 目的の経路に沿ってSegment Listを設定する
4. **トランジットノード**はIPv6の宛先アドレス（DA）に基づいて転送する
5. **エンドポイントノード**はアクティブなSIDを処理し、対応するビヘイビアを実行する
6. **Egressノード**がデカプセル化し、元のパケットを宛先に届ける

!!! example "SRv6パケットの流れ（シンプルな例）"
    ```
    元のパケット: [IPv4: 10.0.0.1 -> 10.0.0.2][Payload]

    SRv6:      [IPv6: A::1 -> B::100]             <- 外側IPv6ヘッダー（DA = アクティブSID）
               [SRH: SL=1, [C::100, B::100]]       <- Segment List
               [IPv4: 10.0.0.1 -> 10.0.0.2]        <- 元のパケット
               [Payload]
    ```

    Segment Listは逆順に格納されます。SL=1なので、アクティブSIDは`Segment List[1]` = `B::100`で、これが外側IPv6ヘッダーの宛先アドレスになります。

## SRv6とMPLSの違い

SRv6は、従来のMPLSと比べてネットワークのプログラミング方法を根本から変えます。MPLSは20ビットのラベルとシグナリングプロトコル（LDP、RSVP-TE）を使いますが、SRv6は128ビットのIPv6アドレスをセグメント識別子（SID）として使うため、オーバーレイの複雑さなしにプログラマブルなネットワークを構築できます。詳しくは[SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md)で比較しています。

## 関連ページ

- :material-arrow-right: [SIDの構造](sid-structure.md) — 128ビットSIDのフォーマット（Locator、Function、Arguments）
- :material-arrow-right: [SRHとパケットウォーク](srh-packet-walk.md) — SRv6パケットがノードごとにどう処理されるか
- :material-arrow-right: [uSID](usid.md) — SIDを圧縮してヘッダーのオーバーヘッドを削減
- :material-arrow-right: [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) — 両者の違いと使い分け
- :material-arrow-right: [Network Programming](../topics/network-programming.md) — SRv6のビヘイビア（End、End.DT4、End.DX6など） *（英語）*
- :material-arrow-right: [Traffic Engineering](../use-cases/traffic-engineering.md) — SRv6による柔軟なトラフィックエンジニアリング *（英語）*
- :material-arrow-right: [Implementations](../implementations/index.md) — Cisco、Juniper、Arista、Nokia、FRR、Linuxの設定ガイド *（英語）*
- :material-arrow-right: [netlab Labs](../labs/netlab.md) — すぐに使えるSRv6ラボを数分で構築 *（英語）*
- :material-file-document: [RFC 8986](../rfcs/rfc8986.md) — SRv6 Network Programmingの仕様 *（英語）*

## 参考文献

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - Segment Routingのアーキテクチャを定義。MPLSとIPv6の両方のデータプレーンを扱う
2. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://www.rfc-editor.org/rfc/rfc8754.html) - IPv6データプレーンで使うSRHを規定
3. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - SRv6ネットワークプログラミングのフレームワークと、基本となるエンドポイントビヘイビアを定義
4. [What is SRv6 network programming? - APNIC Blog](https://blog.apnic.net/2020/05/01/what-is-srv6-network-programming/) - SRv6ネットワークプログラミングの入門記事 *（英語）*
