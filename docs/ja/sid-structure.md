---
title: SIDの構造
seo_title: "SRv6 SIDの構造：Locator・Function・Argumentsとは"
description: "SRv6 SIDの構造を解説。128ビットのSegment IdentifierがLocator、Function、Argumentsをどうエンコードするか、IANAが割り当てた5f00::/16（RFC 9602）とドメイン境界でのフィルタリングまで。"
translation_of: topics/sid-structure.md
tags:
  - 日本語
  - sid
  - RFC 9602
---

# SIDの構造

SRv6の**Segment Identifier（SID）**は128ビットの値で、通常のIPv6アドレスと同じ形式で表記します。SIDは、ノードの位置と、そのノードで実行するビヘイビアの両方をエンコードしています。

## SRv6 SIDの構成

```
|<------------ 128 bits ------------->|
|  Locator      | Function | Arguments|
|<-- L bits --->|<-F bits->|<-A bits->|
```

| フィールド | 説明 | 一般的なサイズ |
|------------|------|:--------------:|
| **Locator** | ノードを識別するルーティング可能なプレフィックス | 40〜64ビット |
| **Function** | ローカルのビヘイビア（End、End.DT4など）を識別 | 16〜24ビット |
| **Arguments** | Functionに渡すオプションのパラメータ | 0〜48ビット |

## 例

```
SID:  5f00:0:1::100

Breakdown:
  Locator:  5f00:0:1::/48   (identifies the node)
  Function: ::100            (End.DT4 - decap and lookup in IPv4 table)
  Args:     (none)
```

この例では、Locator `5f00:0:1::/48`がノードを識別し、Function `::100`がEnd.DT4（デカプセル化してIPv4テーブルを検索）を表します。Argumentsはありません。

!!! info "LocatorはIGPの経路として広告される"
    Locatorのブロックは、IGP（IS-ISまたはOSPFv3）で通常のIPv6経路として広告されます。これにより、ネットワーク内のSRv6対応ノードすべてへの到達性が確保されます。

## IANAが割り当てたSRv6 SIDブロック（`5f00::/16`）

[RFC 9602](https://datatracker.ietf.org/doc/rfc9602/)（2024年10月）は、SRv6のSID専用のIPv6プレフィックスを割り当てています。IANAはこのブロックをIPv6 Unicast Address Registryから割り当て、[IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/iana-ipv6-special-registry.xhtml)に登録しました。

| 項目 | 値 |
|------|----|
| Address Block | `5f00::/16` |
| Name | Segment Routing (SRv6) SIDs |
| RFC | [RFC 9602](https://datatracker.ietf.org/doc/rfc9602/) |
| Allocation Date | 2024-04 |
| Source | True |
| Destination | True |
| Forwardable | True |
| Globally Reachable | False |
| Reserved-by-Protocol | False |

`5f00::/16`は**SRドメイン内では転送可能**ですが、**グローバルには到達不可能**と明示されています。つまり、これらのアドレスを宛先とするパケットがパブリックなインターネットを通過してはいけません。

このブロック内での典型的な割り当て階層は次のとおりです。

```
5f00::/16                          <- IANA SRv6 SID block
  5f00:<domain>::/32               <- Operator / SR domain
    5f00:<domain>:<node>::/48      <- Node locator
      5f00:<domain>:<node>:<func>::/64  <- SID (locator + function)
```

### 事業者のGUAプレフィックスと`5f00::/16`の使い分け

RFC 9602は`5f00::/16`の使用を義務付けてはいません。事業者は、自社のグローバルユニキャストアドレス（GUA）のプレフィックスを引き続きSRv6のLocatorとして使えます。どちらの方式も有効です。

| 方式 | プレフィックスの出どころ | 長所 | 短所 |
|------|--------------------------|------|------|
| IANAのSRv6ブロック | `5f00::/16` | パケットキャプチャやACLで一目でわかる。フィルタリングが簡単。GUAを消費しない | グローバルにはルーティングされない。SRドメイン内でIGP/BGPによる明示的な広告が必要 |
| 事業者のGUA | 事業者の/32や/48 | 事業者ネットワーク内ですでにルーティング可能。通常のIPv6到達性と兼用できる | GUAを消費する。通常のIPv6トラフィックとSRv6トラフィックを見分けにくい |

初期のSRv6導入事例の多く（China Mobile、ソフトバンクなど）は、事業者が割り当てたGUAプレフィックスを使っています。RFC 9602はそれを補完する選択肢で、特にグリーンフィールドの導入や、共通の識別しやすいプレフィックスによってフィルタリングが簡単になるドメイン間SRv6で役立ちます。

### ドメイン境界での`5f00::/16`のフィルタリング

`5f00::/16`を使う場合も自社のGUAを使う場合も、SRv6のSIDがSRドメインの外へ漏れないようにする必要があります。

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

事業者のGUAプレフィックスを使う場合も、同じ考え方を自社のLocatorのプレフィックス範囲に適用してください（[RFC 8754 Section 5.1](https://datatracker.ietf.org/doc/html/rfc8754#section-5.1)も参照）。

## 関連ページ

- :material-arrow-right: [SRv6とは](what-is-srv6.md) — 概要に戻る
- :material-arrow-right: [SRHとパケットウォーク](srh-packet-walk.md) — SIDがパケットの中でどう処理されるか
- :material-arrow-right: [uSID](usid.md) — 圧縮されたSIDのエンコーディング（RFC 9800）
- :material-arrow-right: [Network Programming](../topics/network-programming.md) — SIDとビヘイビアの対応 *（英語）*
- :material-arrow-right: [Security](../topics/security.md) — SRv6のセキュリティ上の考慮事項 *（英語）*
- :material-file-document: [RFC 9602](../rfcs/rfc9602.md) — IANAのSRv6 SIDブロック`5f00::/16` *（英語）*

## 参考文献

1. [RFC 8986 - SRv6 Network Programming](https://datatracker.ietf.org/doc/rfc8986/) - SIDの構造（Locator、Function、Argumentsの各フィールド）を定義
2. [RFC 9602 - SRv6 SIDs in the IPv6 Addressing Architecture](https://datatracker.ietf.org/doc/rfc9602/) - SRv6 SID用の`5f00::/16`のIANA割り当て
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://datatracker.ietf.org/doc/rfc8754/) - SRHの仕様とセキュリティ上の考慮事項
4. [IANA IPv6 Special-Purpose Address Registry](https://www.iana.org/assignments/iana-ipv6-special-registry/) - `5f00::/16`の公式レジストリエントリ
5. [Segment Routing - segment-routing.net](https://www.segment-routing.net/) - SRv6のチュートリアル、デモ、導入情報を掲載するコミュニティサイト *（英語）*
