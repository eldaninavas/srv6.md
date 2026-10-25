---
title: SRv6 日本語ガイド
seo_title: "SRv6 日本語ガイド｜Segment Routing over IPv6 入門"
description: "SRv6の日本語ガイド。Segment Routing over IPv6とは何か、SIDの構造、SRH、uSIDの仕組み、MPLSとの違いをネットワークエンジニア向けに解説する、無料のオープンソース知識ベースです。"
translation_of: index.md
tags:
  - 日本語
  - srv6
  - srv6とは
hide:
  - toc
---

<div class="srv6-hero" markdown>

# SRv6：Segment Routing over IPv6

<p class="srv6-tagline">
  <strong>SRv6</strong>のオープンソース知識ベース、日本語版です。<br>
  SRv6の仕組みを学び、ラボを構築し、コミュニティに貢献しましょう。
</p>

[:material-rocket-launch: &nbsp; はじめる](what-is-srv6.md){ .srv6-btn .srv6-btn-primary }
&nbsp;&nbsp;
[:fontawesome-brands-github: &nbsp; 貢献する](https://github.com/eldaninavas/srv6.md){ .srv6-btn .srv6-btn-secondary }

</div>

## :material-head-question: SRv6（IPv6 Segment Routing）の概要

**SRv6（Segment Routing over IPv6）とは、IPv6そのものを使ってトラフィックを柔軟かつプログラマブルに制御するネットワーク技術です。** 送信元のルーターが、たどるべき経路をSIDと呼ばれるIPv6アドレスの順序付きリストとしてパケットに書き込み、ネットワークはMPLS、LDP、RSVP-TEなしでその経路をたどります。

SRv6は**Segment Routing v6**や**IPv6 Segment Routing**とも呼ばれ、技術的にはSegment Routingアーキテクチャ（[RFC 8402](../rfcs/rfc8402.md)）のIPv6データプレーンです。転送の命令をIPv6パケットのヘッダーに直接エンコードします。MPLSラベルや、LDP・RSVP-TEのようなシグナリングプロトコルに頼る代わりに、128ビットのネイティブなIPv6アドレスを**セグメント識別子（SID）**として使い、ネットワークの経路と振る舞いをプログラムします。

送信元ノードは、パケットの経路と各ホップでの処理を定義する、順序付きのセグメントリストを作成します。アクティブなセグメントはIPv6の宛先アドレスに入り、セグメントが複数ある場合は残りが**Segment Routing Header（SRH）**で運ばれます。さらに[uSID](usid.md)による圧縮を使えば、経路全体が宛先アドレスだけに収まり、SRHがまったく不要になることも珍しくありません。トランジットルーターは宛先アドレスに基づいて転送するだけです。これにより、トラフィックエンジニアリング、VPNサービス、高速迂回（FRR）、サービスファンクションチェイニングを、通常のIPv6ネットワーク上で実現できます。

**従来のMPLSではなくSRv6を選ぶ理由**

- **運用のシンプル化**：MPLSラベルの管理、LDP、RSVPが不要
- **ネイティブIPv6**：既存のIPv6データプレーンをそのまま使い、オーバーレイが不要
- **ネットワークプログラマビリティ**：SRv6のFunction（End、End.DT4、End.DX6など）で振る舞いを定義できる
- **スケーラビリティ**：128ビットのSID空間で大規模ネットワークに対応
- **データプレーンの統一**：トランスポート、VPN、トラフィックエンジニアリングを単一のプロトコルスタックで実現

## :material-book-open-variant: 日本語ガイド

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-help-circle: SRv6とは

セグメント、SRH、ソースルーティング、SRv6パケットの流れなど、基本となる概念を解説します。

[:material-arrow-right: ガイドを読む](what-is-srv6.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-identifier: SIDの構造

128ビットSIDのLocator、Function、Arguments、そしてIANAの`5f00::/16`ブロック。

[:material-arrow-right: 構造を見る](sid-structure.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-routes: SRHとパケットウォーク

ノードごとのパケット処理、Segments Left、PSP/USP/USD、H.Encaps.Red。

[:material-arrow-right: パケットを追う](srh-packet-walk.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-arrow-collapse-horizontal: uSID

マイクロSID（RFC 9800）が1つのIPv6アドレスに最大6つの命令を詰め込む仕組み。

[:material-arrow-right: uSIDを理解する](usid.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-compare: SRv6 vs SR-MPLS

データプレーン、オーバーヘッド、プログラマビリティの違いと、それぞれが適する場面。

[:material-arrow-right: 比較する](srv6-vs-sr-mpls.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-chip: AIのためのSRv6

OpenAI、Microsoft、OracleがMRCとスタティックSRv6 uSIDでGPUファブリックを動かす仕組みと、Meta・AlibabaのScale-Across。

[:material-arrow-right: AIネットワークを知る](ai.md){ .md-button }

</div>

</div>

## :material-chart-bar: State of SRv6 2026

SRv6はどこまで普及したのか。データレポート「State of SRv6 2026」では、SRv6関連のRFC 23本、IETFで進行中のドラフト65本、SRv6の導入を公表している19の組織、11の実装におけるuSID対応状況をまとめました。すべての数値に出典を付けており、グラフは自由に再利用できます。レポートは英語です。

[:material-arrow-right: State of SRv6 2026を読む](../reports/state-of-srv6-2026.md){ .md-button .md-button--primary }

## よくある質問

### SRv6とは何ですか？

SRv6（Segment Routing over IPv6）は、IPv6を使ってトラフィックを制御・プログラムするネットワーク技術です。送信元が経路をSIDと呼ばれるIPv6アドレスのリストとしてパケットに書き込み、ネットワークはMPLS、LDP、RSVP-TEなしでそれに従います。詳しくは[SRv6とは](what-is-srv6.md)をご覧ください。

### SRv6はどのように動作しますか？

送信元ノードはアクティブなセグメントをIPv6の宛先アドレスに入れ、セグメントが複数ある場合は残りをSegment Routing Header（SRH）に入れます。自分のSIDを認識したノードは、次のセグメントへ進む、特定のリンクから送出する、VPNに引き渡すといった命令を実行し、それ以外のルーターは通常のIPv6パケットとして転送します。

### SRv6とMPLSの違いは何ですか？

MPLSはラベルで転送し、ラベルの配布にLDP、RSVP-TE、またはSR-MPLSが必要です。SRv6はIPv6アドレスで転送するためラベル用のプロトコルが不要で、データセンター、クラウド、ホストまでゲートウェイなしで届きます。その代わりヘッダーは大きく、uSIDで約40バイト、MPLSのVPNは約8バイトです。詳しくは[SRv6 vs SR-MPLS](srv6-vs-sr-mpls.md)をご覧ください。

### SRv6は誰が使っていますか？

ソフトバンク、楽天モバイル、Reliance Jio、China Mobileなどの通信事業者や、Microsoft、Meta、Alibaba Cloud、そしてAIの学習ネットワークで使うOpenAIなどです。出典付きの一覧は[Real-World Deployments](../use-cases/deployments.md)にあります。

## :material-compass: その他のコンテンツ（英語）

SRv6.mdのコンテンツの大半は英語で、順次翻訳を進めています。

- :material-traffic-light: [Use Cases](../use-cases/index.md) — トラフィックエンジニアリング、VPN、5G、AIネットワーク、衛星通信など
- :material-server-network: [Implementations](../implementations/index.md) — Cisco IOS-XR/IOS-XE、Juniper、Arista、Nokia、FRR、Linux、SONiCでの設定
- :material-flask: [Labs](../labs/index.md) — netlab、Containerlab、GNS3で作る無料のラボ
- :material-file-document: [RFCs & Standards](../rfcs/index.md) — SRv6関連のRFCをまとめて解説
- :material-graph: [Knowledge Graph](../knowledge-graph.md) — すべての概念をつなぐインタラクティブなマップ

!!! tip "コミュニティプロジェクト"
    SRv6.mdは、ネットワークエンジニアのコミュニティによって作られ、維持されています。ページの翻訳や誤りの修正に協力してみませんか？各ページに編集ボタン（:material-pencil:）があり、コントリビューションを歓迎しています。
