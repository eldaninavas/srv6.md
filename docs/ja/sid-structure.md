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
SID:  5f00:0:1:100::

Breakdown:
  Locator:  5f00:0:1::/48   (bits 0-47: identifies the node)
  Function: 100              (bits 48-63: End.DT4, decapsulate and look up in an IPv4 table)
  Args:     (none)
```

この例では、Locator `5f00:0:1::/48`（ビット0〜47）がノードを識別し、Function `100`（ビット48〜63）がEnd.DT4（デカプセル化してIPv4テーブルを検索）を表します。Argumentsはありません。

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

`5f00::/16`を使う場合も自社のGUAを使う場合も、SRv6のSIDは次の2つのレイヤーでSRドメイン内にとどめます。

1. **経路:** SIDブロックを外部のピアに広告せず、外部のピアからも受け入れない。
2. **パケット:** 外部インターフェースに着信し、宛先がSIDブロック内にあるパケットを破棄する。これにより、外部の誰もSIDに向けてトラフィックを送れなくなる。

=== "Cisco IOS-XR"

    ```cisco
    prefix-set SRV6-SIDS
      5f00::/16 le 128
    end-set
    !
    route-policy NO-SRV6-SIDS
      if destination in SRV6-SIDS then
        drop
      else
        pass
      endif
    end-policy
    !
    router bgp 65000
     neighbor 2001:db8:ff::1
      address-family ipv6 unicast
       route-policy NO-SRV6-SIDS in
       route-policy NO-SRV6-SIDS out
    !
    ipv6 access-list EDGE-IN
     10 deny ipv6 any 5f00::/16
     20 permit ipv6 any any
    !
    interface HundredGigE0/0/0/0
     ipv6 access-group EDGE-IN ingress
    ```

    `else pass`は重要です。IOS-XRのroute policyは、明示的に`pass`しなかったものをすべて破棄します。

=== "Juniper Junos"

    ```junos
    policy-options {
        policy-statement NO-SRV6-SIDS {
            term deny-srv6 {
                from {
                    route-filter 5f00::/16 orlonger;
                }
                then reject;
            }
        }
    }
    firewall {
        family inet6 {
            filter EDGE-IN {
                term no-srv6-sids {
                    from {
                        destination-address {
                            5f00::/16;
                        }
                    }
                    then discard;
                }
                term rest {
                    then accept;
                }
            }
        }
    }
    ```

    `NO-SRV6-SIDS`は外部BGPグループの`import`と`export`の両方のポリシーとして、`EDGE-IN`は外部インターフェース（`family inet6`）の`filter input`として適用します。`orlonger`は必須です。これがないと、ポリシーは/16そのものにしか一致しません。

=== "Linux (ip6tables)"

    ```bash
    # 外部インターフェースのみ：ドメイン内では、SIDブロック宛てのSRv6トラフィックは正当なもの
    ip6tables -t raw -A PREROUTING -i eth-external -d 5f00::/16 -j DROP
    ```

    `raw`テーブルの`PREROUTING`チェーンはルーティング判断の前に処理されるため、`FORWARD`に到達しないローカルSID宛てのパケットも対象になります。

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
