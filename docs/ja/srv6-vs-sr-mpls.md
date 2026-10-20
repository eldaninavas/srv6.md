---
title: SRv6 vs SR-MPLS
seo_title: "SRv6とSR-MPLSの違い：比較と使い分け"
description: "SRv6とSR-MPLSの違いを比較。データプレーン、SIDのサイズと空間、カプセル化とMTUのオーバーヘッド、ネットワークプログラミング、成熟度、そしてどちらを選ぶべきかを解説します。"
translation_of: topics/srv6-vs-sr-mpls.md
tags:
  - 日本語
  - 比較
  - mpls
---

# SRv6 vs SR-MPLS

SRv6とSR-MPLSはどちらもSegment Routingを実装する方式ですが、使うデータプレーンが異なります。ここでは実務の観点から両者を比較します。

## 比較表

| 項目 | SR-MPLS | SRv6 |
|------|---------|------|
| **データプレーン** | MPLS | IPv6 |
| **セグメントID** | 20ビットのラベル | 128ビットのIPv6アドレス |
| **SID空間** | 約100万ラベル | 事実上無制限 |
| **カプセル化** | MPLSラベルスタック | SRv6 SRH（IPv6拡張ヘッダー） |
| **ネットワークプログラミング** | 限定的 | 豊富（End、End.X、End.DT4など） |
| **MTUへの影響** | ラベルごとに4バイト | IPv6 40B + 8B + SIDごとに16B |
| **既存インフラ** | MPLS転送が必要 | ネイティブIPv6を利用 |
| **シグナリング** | 不要（SRv6と同じ） | 不要 |
| **成熟度** | 広く導入済み | 急速に拡大中 |

!!! info "SRv6のオーバーヘッドはもはや以前のものではない"
    SIDごとに16バイトという数字は従来のSRv6の場合です。**uSID**（RFC 9800）を使えば、16バイトのコンテナ1つに最大6つの命令を収められるため、SRv6のオーバーヘッドはMPLSのラベルスタックと同等かそれ以下になります。詳しくは[uSID](usid.md)を参照してください。

## どちらを選ぶべきか

!!! tip "SR-MPLSを選ぶケース"
    - 既存のMPLSインフラがある
    - MTUのオーバーヘッドが懸念事項である
    - 主なユースケースがTEやVPNである

!!! tip "SRv6を選ぶケース"
    - IPv6ネイティブなネットワークを新たに構築する
    - 高度なネットワークプログラマビリティが必要
    - シンプル化と将来性を重視する
    - MPLSを完全になくしたい

## 関連ページ

- :material-arrow-right: [SRv6とは](what-is-srv6.md) — SRv6の基本
- :material-arrow-right: [uSID](usid.md) — SRv6のオーバーヘッドを削減するSID圧縮
- :material-arrow-right: [Interworking & Migration](../topics/interworking-migration.md) — MPLSからSRv6への移行 *（英語）*
- :material-arrow-right: [Use Cases](../use-cases/index.md) — SRv6のユースケース *（英語）*

## 参考文献

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - MPLSとIPv6の両データプレーンを含むSRアーキテクチャを定義
2. [RFC 8660 - Segment Routing with the MPLS Data Plane](https://datatracker.ietf.org/doc/html/rfc8660) - SR-MPLSの転送動作と、MPLSラベルによるセグメントのエンコードを規定
3. [Cisco Segment Routing Overview and Migration Guidelines](https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/mpls/215215-segment-routing-overview-and-migration-g.html) - SRの導入と従来のMPLSからの移行に関する実践的な概要 *（英語）*
