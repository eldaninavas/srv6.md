---
title: uSID
seo_title: "SRv6 uSID（マイクロSID）とは：SID圧縮の仕組み"
description: "SRv6のuSID（マイクロSID、RFC 9800）がヘッダーのオーバーヘッドをどう削減するかを解説。コンテナの構造、シフト＆ルックアップ動作、従来のSRv6との比較、uSIDとG-SRv6の違い、設定例まで。"
translation_of: topics/usid-compression.md
tags:
  - 日本語
  - usid
  - rfc9800
---

# uSID：SRv6のSID圧縮

SRv6に対する初期の批判の1つが**オーバーヘッド**でした。SIDは1つあたり128ビット（16バイト）あり、5つのSIDからなるセグメントリストは、すべてのパケットに80バイトを追加します。**マイクロSID（uSID）**は、複数のセグメント命令を128ビットのSID 1つに詰め込むことで、この問題を解決します。

## 課題

従来のSRv6では、セグメントリストのホップごとに16バイトかかります。

```
Classic SRv6 (5 SIDs = 80 bytes overhead):
┌──────────────────────────────────────────────┐
│ SRH: Segment List                             │
│   [0]: fc00:0:5::1  (16 bytes)               │
│   [1]: fc00:0:4::1  (16 bytes)               │
│   [2]: fc00:0:3::1  (16 bytes)               │
│   [3]: fc00:0:2::1  (16 bytes)               │
│   [4]: fc00:0:1::1  (16 bytes)               │
│                          Total: 80 bytes      │
└──────────────────────────────────────────────┘
```

短いパケットや遅延に敏感なトラフィックでは、このオーバーヘッドは無視できません。

## 解決策：マイクロSID（uSID）

uSID（RFC 9800）は、128ビットのコンテナ1つに**最大6つのマイクロ命令**を詰め込みます。

```
uSID Container (6 micro-SIDs = 16 bytes total!):
┌──────────────────────────────────────────────┐
│ Single 128-bit IPv6 Address:                  │
│                                               │
│  fcbb:bbbb:0001:0002:0003:0004:0005:0006    │
│  ├──┬────┤├──┤├──┤├──┤├──┤├──┤├──┤          │
│  │ Block ││uS1││uS2││uS3││uS4││uS5││uS6│   │
│  │(32bit)││16b││16b││16b││16b││16b││16b│     │
│                          Total: 16 bytes!     │
└──────────────────────────────────────────────┘
```

### 構造

| 要素 | サイズ | 説明 |
|------|:------:|------|
| **uSID Block** | 32ビット | ドメイン内のすべてのuSIDに共通のプレフィックス（例：`fcbb:bbbb`） |
| **uSID** | 各16ビット | ノードとビヘイビアを識別する個々のマイクロ命令 |
| **End-of-Container** | 16ビット（0000） | コンテナ内の有効なuSIDの終わりを示す |

### 動作の仕組み

uSIDコンテナの処理は、シンプルな**シフト＆ルックアップ（shift-and-lookup）**です。

```
ステップ1 - Ingressが受信:
  DA = fcbb:bbbb:0001:0002:0003:0000:0000:0000
                  ^^^^
                  アクティブuSID → ノード1

ステップ2 - ノード1がuSID 0001を処理し、左にシフト:
  DA = fcbb:bbbb:0002:0003:0000:0000:0000:0000
                  ^^^^
                  アクティブuSID → ノード2

ステップ3 - ノード2がuSID 0002を処理し、左にシフト:
  DA = fcbb:bbbb:0003:0000:0000:0000:0000:0000
                  ^^^^
                  アクティブuSID → ノード3

ステップ4 - ノード3がuSID 0003を処理し、左にシフト:
  DA = fcbb:bbbb:0000:0000:0000:0000:0000:0000
                  ^^^^
                  End-of-Container (0000) → SRHの次のエントリへ
```

## オーバーヘッドの比較

| シナリオ | 従来のSRv6 | uSID | 削減率 |
|----------|:----------:|:----:|:------:|
| SID 3つ | 48バイト | 16バイト | **67%** |
| SID 6つ | 96バイト | 16バイト | **83%** |
| SID 10個 | 160バイト | 32バイト（コンテナ2つ） | **80%** |
| SID 12個 | 192バイト | 32バイト（コンテナ2つ） | **83%** |

!!! tip "16バイトで6ホップ"
    uSIDコンテナ1つで、従来のSRv6がSID **1つ**に使うのと同じ領域に、**最大6つ**のセグメント命令をエンコードできます。これにより、オーバーヘッドの点でSRv6はMPLSのラベルスタックと同等か、それ以上になります。

## uSIDとG-SRv6

2つの圧縮方式が登場し、現在は**RFC 9800**の下で統一されています。

| 項目 | uSID（NEXT-C-SID） | G-SRv6（REPLACE-C-SID） |
|------|:------------------:|:-----------------------:|
| **提案元** | Cisco、Bell Canada | China Mobile、Huawei |
| **処理方式** | シフト＆ルックアップ | リプレース＆ルックアップ |
| **uSIDのサイズ** | 16または32ビット | 16または32ビット |
| **RFC** | RFC 9800 | RFC 9800 |
| **採用状況** | 世界の複数の事業者 | 世界の複数の事業者 |

どちらも**RFC 9800**（SRv6 SID Compression）で標準化されており、相互運用性が確保されています。

## 設定例

=== "Cisco IOS-XR"

    ```cisco
    segment-routing
     srv6
      locators
       locator uSID-MAIN
        micro-segment behavior unode psp-usd
        prefix fcbb:bb01::/48
       !
      !
     !
    !
    ```

=== "Linux (iproute2)"

    ```bash
    # uSIDコンテナでカプセル化
    ip route add 10.0.0.0/24 encap seg6 mode encap \
      segs fcbb:bbbb:0001:0002:0003:: dev eth0
    ```

## 導入状況

複数の事業者がSRv6 uSIDの導入を公表しています。公開された発表の一覧と出典へのリンクは[Real-World Deployments](../use-cases/deployments.md) *（英語）* にまとめています。

## 関連ページ

- :material-arrow-right: [SRHとパケットウォーク](srh-packet-walk.md) — SRHがどう処理されるか
- :material-arrow-right: [SIDの構造](sid-structure.md) — 従来のSIDのフォーマット
- :material-arrow-right: [SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md) — オーバーヘッドを含めた両者の比較
- :material-arrow-right: [Real-World Deployments](../use-cases/deployments.md) — uSIDを運用している事業者 *（英語）*
- :material-arrow-right: [Cisco IOS-XR](../implementations/cisco-ios-xr.md) — IOS-XRでのuSID Locatorの設定 *（英語）*
- :material-arrow-right: [Cisco IOS-XE](../implementations/cisco-ios-xe.md) — IOS-XEでのF3216 uSIDの設定 *（英語）*
- :material-arrow-right: [Arista EOS](../implementations/arista-eos.md) — Arista EOSのuNとuAのサポート *（英語）*
- :material-arrow-right: [netlab Labs](../labs/netlab.md) — すぐに使えるラボでuSIDを試す *（英語）*

## 参考文献

1. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://datatracker.ietf.org/doc/rfc9800/) - SRv6の圧縮方式としてNEXT-C-SIDとREPLACE-C-SIDのフレーバーを定義する標準化RFC
2. [draft-filsfils-spring-net-pgm-extension-srv6-usid - SRv6 uSID Instruction](https://datatracker.ietf.org/doc/draft-filsfils-spring-net-pgm-extension-srv6-usid/) - マイクロSID（uSID）のネットワークプログラミング拡張を最初に提案したIETFドラフト
3. [Bell Canada SRv6-uSID Deployment (PDF)](https://www.segment-routing.net/images/2023-03-30-srv6-workshop-bell-canada.pdf) - Bell CanadaにおけるSRv6 uSIDの商用運用についてのDaniel Voyer氏の講演資料 *（英語）*
4. [Segment Routing - SRv6 uSID L3VPN Interoperability](https://www.segment-routing.net/demos/2020-12-22-SRv6-uSID-L3VPN-interoperability/) - segment-routing.netによるSRv6 uSID L3VPNのマルチベンダー相互接続デモ *（英語）*
