---
title: SRv6 vs MPLS
og_image: assets/images/srv6-vs-mpls-overhead.png
seo_title: "SRv6 vs MPLS・SR-MPLS：違い、オーバーヘッド、使い分け"
description: "SRv6 vs MPLSを比較。従来のMPLS（LDP、RSVP-TE）、SR-MPLS、SRv6を並べ、ヘッダーのオーバーヘッドを実数値で示し、ハードウェア、ドメイン間、セキュリティ、運用、使い分けまで解説します。"
translation_of: topics/srv6-vs-sr-mpls.md
tags:
  - 日本語
  - 比較
  - mpls
  - srv6 vs mpls
---

# SRv6 vs MPLS・SR-MPLS

**SRv6とMPLSが解決する課題は同じです。プロバイダーネットワーク上でトラフィックの経路を制御し、VPNを運ぶことです。違いはデータプレーンにあります。** MPLSはラベルで転送し、専用のコントロールプロトコル（LDP、RSVP-TE）かSegment Routing（SR-MPLS）を必要とします。SRv6は通常のIPv6アドレスで転送するため、どちらも必要ありません。このページでは、従来のMPLS、SR-MPLS、SRv6の3つを、よく語られる論点の裏にある実際の数値とともに比較します。

!!! abstract "結論"
    - **従来のMPLSからSR-MPLSへ**移行すると、LDPとRSVP-TEはなくなりますが、MPLSデータプレーンは残ります。全体がMPLS対応ハードウェアで構成されたネットワークにとって、リスクの低いステップです。
    - **SRv6**はMPLSデータプレーンもなくします。1つのIPv6ヘッダーで経路、VPN、サービスを運び、WANからデータセンター、クラウド、ホストまで届きます。
    - **主なトレードオフはオーバーヘッドです。** 一般的なSR-MPLSのVPNでは8バイト、SRv6 uSIDのVPNでは40バイトが加わります。1500バイトのパケットでは0.5%対2.7%です。
    - **現在SRv6を採用する事業者の多くは**、ハードウェアが対応していれば**SRv6 uSIDへ直接移行し**、対応していない部分ではSR-MPLSを使っています。[移行](../topics/interworking-migration.md)（英語）を参照してください。

## 3つの世代

| | 従来のMPLS | SR-MPLS | SRv6 |
|--|-------------|---------|------|
| データプレーン | MPLSラベル | MPLSラベル | IPv6 |
| ラベル／SIDの配布 | LDP、RSVP-TE | IGP（IS-IS、OSPF）またはBGP | IGPまたはBGP（LocatorはIPv6プレフィックス） |
| トラフィックエンジニアリング | RSVP-TE：すべてのトランジットルーターにトンネルごとの状態 | SR Policy：状態はヘッドエンドのみ | SR PolicyとFlex-Algo：状態はヘッドエンドのみ |
| 高速迂回 | RSVP-TE FRR、LFA（部分的なカバレッジ） | TI-LFA（完全なカバレッジ） | TI-LFA（完全なカバレッジ） |
| セグメント識別子 | — | 20ビットのラベル（SRGB内のグローバルインデックス、またはローカル） | 128ビットのIPv6アドレス（Locator : Function : Argument） |
| サービス | L3VPN、L2VPN、EVPN | 同じ | 同じ。SRv6 SIDでシグナリング（[RFC 9252](../rfcs/rfc9252.md)） |
| 標準 | RFC 3031、LDP RFC 5036、RSVP-TE RFC 3209 | RFC 8402、RFC 8660、IGP拡張 RFC 8665/8667 | [RFC 8754](../rfcs/rfc8754.md)、[RFC 8986](../rfcs/rfc8986.md)、[RFC 9800](../rfcs/rfc9800.md) |

Segment Routing（[RFC 8402](../rfcs/rfc8402.md)）は、2つのデータプレーンを持つ1つのアーキテクチャです。SR-MPLSとSRv6は、ソースルーティング、Prefix SegmentとAdjacency Segment、TI-LFA、SR Policy、Flex-Algoといった考え方を共有しています。違うのは、セグメントをパケット内でどうエンコードするかです。

## パケットはどう変わるか

<figure markdown="span">
  ![レイヤー3 VPNパケットにおけるSRv6とMPLSのヘッダーオーバーヘッド：MPLSまたはSR-MPLSは4バイトのラベル2つ（8バイト）、uSIDを使うSRv6は40バイトの外側IPv6ヘッダー1つ、Segment Routing Headerを使うSRv6は40 + 8バイトに追加SIDごとに16バイトを加える。](../assets/images/srv6-vs-mpls-overhead.png){ width="1200" height="630" loading="lazy" }
  <figcaption>SRv6 vs MPLS：各カプセル化方式がVPNパケットに加えるバイト数</figcaption>
</figure>

トラフィックエンジニアリングなしでコアを通過するレイヤー3 VPNパケットの場合です。

```
従来のMPLS / SR-MPLS            +8 bytes
[ Ethernet ][ トランスポートラベル | VPNラベル ][ 顧客のIPパケット ]
              4 bytes                4 bytes

SRv6 uSID（SRHなし）            +40 bytes
[ Ethernet ][ 外側IPv6、DA = 5f00:0:0100:e004:: ][ 顧客のIPパケット ]
              40 bytes：ノードuSIDとVPN uSIDを1つのアドレスに格納

SRv6 SRHあり                    +40 + 8 + 16 × n bytes
[ Ethernet ][ 外側IPv6 ][ SRH：追加SID n個 ][ 顧客のIPパケット ]
```

トラフィックエンジニアリングを使うと差は縮まります。SR-MPLSではセグメントが1つ増えるごとに4バイトのラベルが1つ加わりますが、SRv6 uSIDは同じ128ビットの宛先アドレスに最大6つの命令を詰め込めます。出口PEがそのうち2つ（自身のノードuSIDとVPN uSID）を使うため、経由点が4つのTE経路とVPNサービスを組み合わせても40バイトのままです。SRHが必要になるのはそれより長い経路だけで、SRHは8バイトに加え、命令6つごとに16バイトを追加します。

| ケース | SR-MPLS | SRv6 uSID |
|------|:-------:|:---------:|
| VPN、最短経路 | 8 B | 40 B |
| VPN + TE経由点3つ | 20 B | 40 B |
| VPN + TE経由点4つ | 24 B | 40 B |
| VPN + TE経由点5つ | 28 B | 64 B（SRHコンテナ1つ） |
| VPN + TE経由点10個 | 48 B | 64 B（SRHコンテナは1つのまま） |

実務上の意味はこうです。コアのMTUを引き上げれば（ほとんどのコアはすでに9000以上で運用されています）、実際に転送するどのパケットサイズでもオーバーヘッドは問題になりません。帯域に占める割合として差を最も感じるのは、音声やゲームなど小さなパケットが中心のワークロードです。オーバーヘッドの詳しい比較は[uSIDのページ](usid.md)に、6つのuSIDが1つのアドレスにどう収まるかは[SIDデコーダー](../tools/sid-decoder.md)（英語）にあります。

## 本当に違うところ

### コントロールプレーン

従来のMPLSでは、IGPの上に2〜3種類のプロトコルが必要です。ラベル用のLDP、経路制御用のRSVP-TE、そしてその間の同期（LDP-IGP同期、RSVP-TEのリフレッシュ、FRRのバイパストンネル）です。SR-MPLSとSRv6はどちらもこれらをすべて不要にします。IGPがセグメントを広告し、BGPがサービスをシグナリングし、必要に応じてPCEが明示的な経路を計算します。

**SR-MPLSにはMPLSの状態が1つ残ります。** ドメイン全体で一貫させる必要のあるラベルブロック（SRGB）と、Adjacencyやサービスのためのラベル割り当てです。**SRv6はラベルをアドレスに置き換えます。** 各ノードはLocatorプレフィックスを持ち、SIDはその中でルーティング可能です。調整すべきラベルブロックはなく、コアでは他のIPv6プレフィックスと同じようにLocatorを集約できます。

### MPLSコアの外への到達性

多くのネットワークにとって、これが決め手になります。MPLSは、すべてのホップがMPLSを転送できる場所でしか機能しません。パブリッククラウド、ほとんどのデータセンターファブリック、インターネットはMPLSを転送しないため、MPLSのサービスはエッジで止まり、その先に進むにはゲートウェイやGRE、VXLANでのスティッチングが必要です。

SRv6はどんなIPv6ネットワーク上でも動作します。トランジットルーターは宛先アドレスで転送するだけで、SRv6を理解する必要はまったくありません。SRv6への対応が必要なのはSIDを実行するノードだけです。こうしてSRv6は、MPLSが届かなかった[クラウドバックボーン](../use-cases/cloud-native-backbone.md)（英語）、[Kubernetesホスト](../topics/host-based-srv6.md)（英語）、[AIのGPUファブリック](ai.md)まで到達します。

### ネットワークプログラミング

MPLSラベルの意味は「ここへ転送せよ」か「これはVPN Xである」です。SRv6 SIDはさらにFunctionとArgumentsも運べます。[RFC 8986](../rfcs/rfc8986.md)はデカプセル化してルックアップする、クロスコネクトする、ポリシーにバインドするといったビヘイビアを定義し、その後のRFCで[モバイルユーザープレーン](../rfcs/rfc9433.md)、[マルチキャストの複製](../rfcs/rfc9524.md)、[Argumentのシグナリング](../rfcs/rfc9819.md)が加わりました。実際には、ほとんどのネットワークはどちらの世界でも同じ少数のビヘイビアを使っています。違いが表れるのは、モバイル、サービスチェイニング、ホストベースのユースケースです。

### ロードバランシング

MPLSのトランジットルーターはラベルスタックでハッシュするため、フローを分散させるにはエントロピーラベル（[RFC 6790](https://www.rfc-editor.org/rfc/rfc6790)）かディープパケットインスペクションが必要です。SRv6ではヘッドエンドが内側のフローからIPv6フローラベルを設定し、各トランジットルーターは外側IPv6ヘッダーでハッシュします。これはどのIPv6トラフィックに対してもすでに行っている処理です。

### ドメイン間接続

ドメインをまたぐMPLS VPNには、Inter-ASオプションA、B、Cと、境界でのラベルのスティッチングが必要です。SRv6のSIDはIPv6プレフィックスです。Locatorを相手ドメインに広告または集約すればエンドツーエンドの経路が機能し、一方のドメインのトポロジーを他方から隠したい場所ではBinding SIDを使います。[Inter-Domain SRv6](../topics/inter-domain.md)（英語）を参照してください。

### セキュリティ

MPLSコアは構造的に分離されています。ラベルは外部からルーティングできないため、外部のパケットがMPLS転送に到達することはありません。SRv6のSIDはIPv6アドレスなので、同じ分離を自ら作る必要があります。すべての外部インターフェースで、SIDブロック（理想的には`5f00::/16`、[RFC 9602](../rfcs/rfc9602.md)）とSRH付きパケットをフィルタリングします（[RFC 8754 セクション5](../rfcs/rfc8754.md)）。明確に定義された1つのフィルターですが、省略はできません。[Security](../topics/security.md)（英語）を参照してください。

### 運用

MPLSには、LSP pingとtraceroute（[RFC 8029](https://www.rfc-editor.org/rfc/rfc8029)）と、数十年分のツールやランブックがあります。SRv6では、SIDに対する標準のIPv6 pingとtraceroute、そして[RFC 9259](../rfcs/rfc9259.md)のOAM拡張を使います。WiresharkはSRHをネイティブにデコードします（[パケットキャプチャー](../labs/pcaps.md)、英語）。すでにIPv6に慣れたチームにとってSRv6は読みやすく、MPLSのランブックを深く作り込んだチームには再教育が必要です。

### ハードウェアと成熟度

MPLS転送は、この20年間に作られたすべてのサービスプロバイダー向けルーターに搭載されています。SRv6、特にuSIDには新しいシリコンが必要です。現行のNPUやマーチャントスイッチチップはuSIDをラインレートで処理できますが、古いラインカードはSR-MPLSのみ、またはSID数の上限が小さいフルレングスのSRv6しかサポートしないことがあります。導入を決める前に、[サポートマトリクス](../implementations/support-matrix.md)（英語）とプラットフォームごとのプッシュできるSIDの深さを確認してください。現在最も広く導入されているSRの方式はSR-MPLSですが、最も速く伸びているのはSRv6で、ソフトバンクや楽天モバイルからMicrosoft、Meta、Alibaba Cloudまで、[19の組織](../reports/state-of-srv6-2026.md#deployments-19-organizations)（英語）が本番環境での利用を公表しています。

## 使い分け

!!! tip "従来のMPLSに（当面）とどまるケース"
    - ネットワークが安定しており、RSVP-TEで必要なことができていて、変更を迫られる要因がない。
    - それでもSegment Routingへの移行は計画しておきましょう。LDPとRSVP-TEは、ベンダーの投資が最も少ない分野です。

!!! tip "SR-MPLSを選ぶケース"
    - ルーターはMPLSを転送できるが、SRv6（またはuSID）をラインレートで処理できない。
    - データプレーンを変えずに、TI-LFAとSR Policyを今すぐ使いたい。
    - コアの外への到達性よりも、パケットごとのオーバーヘッドが重要である。

!!! tip "SRv6を選ぶケース"
    - 新しいネットワークを構築する、またはハードウェアを更改する。
    - MPLSを動かしていないデータセンター、クラウド、ホストまでサービスを届ける必要がある。
    - アクセスからAIファブリックまで、途中にゲートウェイを挟まず1つのカプセル化で通したい。
    - チームがいずれにせよIPv6のみの運用に移行しつつある。

移行期間中は、多くの事業者が両方を運用しています。まだSRv6に対応できない部分ではSR-MPLSを、それ以外ではSRv6を使い、その間をインターワーキングゲートウェイやBinding SIDでつなぎます。グリーンフィールド、ship-in-the-night、段階的移行の各戦略については、実例を交えて[移行ガイド](../topics/interworking-migration.md)（英語）で解説しています。

## よくある質問

### SRv6はMPLSより優れていますか？

どこでも優れているわけではありません。SRv6はプロトコル（LDP、RSVP-TE、MPLSデータプレーンそのもの）を減らし、MPLSが届かないクラウド、データセンター、ホストまで到達できます。MPLSとSR-MPLSはパケットごとのオーバーヘッドが小さく、古いハードウェアでも動作します。新しいネットワークやハードウェア更改では、現在ほとんどの事業者がuSIDを使ったSRv6を選んでいます。

### SRv6はMPLSを置き換えますか？

多くのネットワークで、段階的に置き換えが進んでいます。LDPとRSVP-TEはSegment Routingに置き換えられつつあり、Segment Routingの導入の中ではSRv6が最も速く伸びています。特に5Gトランスポート、クラウドバックボーン、AIネットワークで顕著です。既存のネットワークではMPLSが今後何年も使われ続け、ハードウェアがSRv6に対応できない場所ではSR-MPLSが今も妥当な選択肢です。

### SRv6とSR-MPLSの違いは何ですか？

どちらも同じSegment Routingアーキテクチャ（RFC 8402）を実装しています。SR-MPLSはセグメントを20ビットのMPLSラベルとしてエンコードし、SRv6はFunctionとArgumentsも運ぶ128ビットのIPv6アドレスとしてエンコードします。SRv6はラベルブロックを必要とせず、どんなIPv6ネットワーク上でも動作します。一方、SR-MPLSはヘッダーが小さくなります。

### SRv6はMPLSと比べてどれくらいのオーバーヘッドを加えますか？

一般的なSR-MPLSのVPNでは8バイト（ラベル2つ）です。uSIDを使うSRv6のVPNでは40バイト（外側IPv6ヘッダー1つ）で、経由点が4つまでのトラフィックエンジニアリング経路ならこのサイズのままです。それより長い経路ではSegment Routing Headerが加わり、8バイトに加えて命令6つごとに16バイトが増えます。圧縮を使わない従来のSRv6では、SIDごとに16バイトが加わります。

### SRv6とMPLSは同じネットワークで共存できますか？

できます。ship-in-the-nightの導入では、SRv6のサービスをMPLSと並行して動かし、VRFを1つずつ移行します。また、インターワーキングゲートウェイやBinding SIDによって、SR-MPLSドメインとSRv6ドメインをエンドツーエンドで接続できます。[移行ガイド](../topics/interworking-migration.md)（英語）を参照してください。

## 関連ページ

- :material-arrow-right: [SRv6とは](what-is-srv6.md)：SRv6の総合的な入門
- :material-arrow-right: [MPLSからSRv6への移行](../topics/interworking-migration.md)：移行戦略、インターワーキング、段階的な展開 *（英語）*
- :material-arrow-right: [uSID](usid.md)：SRv6のオーバーヘッドがもはや問題にならない理由
- :material-arrow-right: [SRv6 White Paper 2026](../white-papers/srv6-white-paper-2026.md)：アーキテクトのための設計と移行の判断 *（英語）*
- :material-arrow-right: [Real-World Deployments](../use-cases/deployments.md)：本番環境でSRv6を運用している組織 *（英語）*

## 参考文献

1. [RFC 8402 - Segment Routing Architecture](https://www.rfc-editor.org/rfc/rfc8402) - MPLSとIPv6の両データプレーンに共通の1つのアーキテクチャ
2. [RFC 8660 - Segment Routing with the MPLS Data Plane](https://www.rfc-editor.org/rfc/rfc8660) - SR-MPLSの転送とラベルのエンコード
3. [RFC 8754 - IPv6 Segment Routing Header (SRH)](https://www.rfc-editor.org/rfc/rfc8754) - SRv6の拡張ヘッダーとそのセキュリティモデル
4. [RFC 8986 - SRv6 Network Programming](https://www.rfc-editor.org/rfc/rfc8986) - SRv6のエンドポイントとヘッドエンドのビヘイビア
5. [RFC 9800 - Compressed SRv6 Segment List Encoding](https://www.rfc-editor.org/rfc/rfc9800) - uSID（NEXT-C-SID）とREPLACE-C-SID
6. [RFC 5036 - LDP Specification](https://www.rfc-editor.org/rfc/rfc5036)と[RFC 3209 - RSVP-TE](https://www.rfc-editor.org/rfc/rfc3209) - 従来のMPLSのコントロールプレーン
7. [RFC 6790 - The Use of Entropy Labels in MPLS Forwarding](https://www.rfc-editor.org/rfc/rfc6790) - MPLSコアでのロードバランシング
8. [Cisco Segment Routing Overview and Migration Guidelines](https://www.cisco.com/c/en/us/support/docs/multiprotocol-label-switching-mpls/mpls/215215-segment-routing-overview-and-migration-g.html) - LDP/RSVP-TEからSRへの移行に関する実践的な概要 *（英語）*
