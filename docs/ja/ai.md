---
title: AIのためのSRv6
seo_title: "SRv6 AIネットワーク完全ガイド｜MRCとuSIDの仕組み"
description: "AIネットワークにおけるSRv6の日本語ガイド。OpenAI、Microsoft、OracleがMRCとスタティックSRv6 uSIDでGPUファブリックを運用する仕組み、Meta・AlibabaのScale-Across、標準化動向、よくある質問まで解説します。"
translation_of: ai/index.md
tags:
  - 日本語
  - ai
  - gpu
  - mrc
  - usid
  - srv6 ai
---

# AIのためのSRv6：完全ガイド

**SRv6は、AIネットワークの基盤となる技術になりました。** GPUの学習用ファブリックでは、送信側のNICがすべてのパケットの正確な経路を、16ビットのuSIDのリストとしてIPv6の宛先アドレスに書き込みます。スイッチはルーティングプロトコルを使わず、スタティックなテーブルだけで転送します。トランスポートは数百本の明示的な経路にトラフィックを分散（スプレー）し、障害の起きた経路をマイクロ秒単位で切り離します。データセンター間では、SRv6のトラフィックエンジニアリングがAIトラフィックをWAN上で制御します。OpenAI、Microsoft、OracleはAI学習用ファブリックでSRv6を運用し、MetaはAIクラスターを相互接続するバックボーンで、Alibaba CloudはAIコンピューティングネットワーク全体でSRv6を使っています。

!!! abstract "要点（2026年10月時点）"
    - **商用運用**：スタティックSRv6上の[MRC](../ai/mrc.md) *（英語）* が、OpenAIの最大規模のGB200クラスター、MicrosoftのFairwaterスーパーコンピューター、そしてテキサス州アビリーンを含むOracleのOCIクラスターで、フロンティアモデルの学習に使われています。報告されているジョブは75,000 GPUに達し、ファブリックは2階層で131,072 GPUを収容する設計です。
    - **バックエンドにBGPなし**：スイッチが持つのは、設置時に一度だけ書き込む小さなスタティックuSIDテーブルです。障害対応はNICに移ります。
    - **40バイト**：uSIDを使えば、経路全体が1つのIPv6宛先アドレスに収まり、Segment Routing Header（SRH）は不要です。
    - **Scale-Across**：Meta（リージョナルバックボーン、2026年10月に最初のSRv6 TEサイトを商用化）とAlibaba（ジョブ単位のSRv6 TEを行う専用の「eCore for AI」）が、AIサイト間でSRv6を使っています。
    - **標準化**：データプレーンはRFC 8986とRFC 9800、AIでの使い方は[draft-filsfils-srv6ops-srv6-ai-backend](../ai/ai-standards.md) *（英語）*（-05、Cisco、OpenAI、Microsoft、Oracle、IBM、NVIDIA、Arrcusの共著）、トランスポートはOCP MRC 1.0、スイッチソフトウェアはSONiC 202505以降で規定されています。

## SRv6がAIネットワークに適している理由

1. **ハッシュではなく決定的な経路。** AIの学習は少数の巨大な同期フローで構成され、ECMPにとって最悪のケースです。SRv6では送信側がすべてのパケットを既知の経路に載せるため、ハッシュの衝突がなく、経路の切り替えも正確です。[SRv6 vs ECMP、Adaptive Routing、Ultra Ethernet](../ai/srv6-vs-ai-fabric-alternatives.md) *（英語）* を参照してください。
2. **スタティックでシンプルなファブリック。** スタティックなuSIDルートが、BGPとその再収束を置き換えます。MRCを運用する事業者は、学習チームと調整せずにスパインスイッチを再起動しています。
3. **実態に即した可視性。** データと同じuSID経路を使うプローブは、データが経験するものをそのまま検証します。OpenAIのClustermapperは、すべてのリンクを1ミリ秒ごとにプローブしています。[AI Fabric Telemetry](../ai/ai-fabric-telemetry.md) *（英語）* を参照してください。
4. **最小限のオーバーヘッド。** uSID（[RFC 9800](../rfcs/rfc9800.md)）は、最大6ホップを128ビットのアドレス1つに詰め込みます。コストは40バイトの外側IPv6ヘッダー1つだけで、主流のスイッチASICがラインレートで処理します。
5. **GPUからWANまで1つの技術。** 同じSRv6データプレーンが、バックエンドファブリック、データセンターのフロントエンド、DC間バックボーンを担い、DCのエッジにMPLSゲートウェイは必要ありません。[Scale-Across](../ai/scale-across.md) *（英語）* を参照してください。
6. **オープンでマルチベンダー。** NICはNVIDIA、AMD、Broadcom、スイッチはNVIDIA、Arista（Broadcom搭載）、Cisco Silicon One、そしてオープンソースのSONiC、SAI、FRRが使われています。

## AIでSRv6を使っている組織

| 組織 | SRv6の適用箇所 | 内容 | 状況 | 出典 |
|------|----------------|------|------|------|
| **OpenAI** | GPUバックエンドファブリック | スタティックなuSIDソースルーティング上のMRC、ダイナミックルーティングなし、Clustermapperによるプロービング | 商用運用（最大規模のGB200クラスター） | [MRC論文](https://arxiv.org/abs/2605.04333) |
| **Microsoft** | Fairwater AIスーパーコンピューター | スケールアウトネットワークでスタティックSRv6がBGPを置き換え、SONiCへのSRv6コントリビューション | 商用運用 | [Azure HPC blog](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) |
| **Oracle（OCI）** | テキサス州アビリーンを含むAcceleronマルチプレーンネットワーク | SRv6ソースルーティングを用いたMRC | 商用運用（IETFドラフトによる） | [draft -05](https://www.ietf.org/archive/id/draft-filsfils-srv6ops-srv6-ai-backend-05.txt) |
| **Meta** | DCキャンパスとAIクラスターを相互接続するリージョナルバックボーン | FBOSSとCisco Silicon One上で、中央コントローラーによるuSIDトラフィックエンジニアリング | 最初のSRv6 TEサイトが商用運用開始（2026年10月） | [Meta Engineering](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) |
| **Alibaba Cloud** | AIコンピューティングネットワークと「eCore for AI」Scale-Acrossバックボーン | 14以上のAIクラスター（90,000台のサーバー）にわたるIPv6/SRv6、サイト間での学習ジョブ単位のSRv6 TE | 商用運用 | [IETF 125](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02)、[OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-alibaba-cisco-te/) |
| **Google** | Virgo AIファブリック | 独自のホストスタックを動かすベアメタル顧客向けのSRv6ソースルーティング | ファブリックで提供 | [OCP 2026](https://www.segment-routing.net/conferences/2026-10-15-ocp-summit26-google-virgo/) |
| **Nebius** | GPUクラウドのDCとWAN | DCとWAN間のプロトコル変換なしのエンドツーエンドSRv6 VPNとTE | 商用運用 | [@Scale 2026](https://www.segment-routing.net/conferences/2026-08-25-atscale-nebius-srv6-interconnects/) |
| **China Telecom** | 計算力（コンピューティングパワー）メトロネットワーク | 100〜500 kmのクラスター間学習のための、SRv6 Policy上のL3EVPN | 商用網でのトライアル | [ホワイトペーパー](https://www.gfnds.com/uploads/20250818/59e55fd7289db89d0a8e02ccd676ae87.pdf) |

AI以外でのSRv6の導入事例は、[Real-World Deployments](../use-cases/deployments.md) *（英語）* を参照してください。

## タイムライン

| 時期 | 出来事 |
|------|--------|
| 2025年4月 | AIバックエンド向けSRv6に関する最初のIETFドラフト（Cisco） |
| 2025年 | SONiC 202505が、ソースルーティング型AIバックエンド向けのスタティックSRv6設定を提供 |
| 2025年6月 | Ultra Ethernet 1.0が公開（エントロピーベースのスプレー、SRv6は使わない） |
| 2026年1月 | Microsoft Researchが、AIバックエンドにおけるSRv6のパケットステアリングに関するテクニカルレポートを発表 |
| 2026年2月 | NANOG 96：CiscoとMicrosoftが、AIバックエンドへのSRv6 uSIDとSONiCの導入について講演 |
| 2026年3月 | IETF 125：Alibabaが、同社のAIコンピューティングは全面的にIPv6/SRv6を基盤としていると報告 |
| **2026年5月5日** | **OpenAIとパートナー各社がMRCとそのスタティックSRv6設計を公表、OCP MRC 1.0をリリース** |
| 2026年7月 | IETF 126：AIバックエンドドラフトの著者がワーキンググループでの採択を要請 |
| 2026年9月 | draft-filsfils-srv6ops-srv6-ai-backend-05（Cisco、OpenAI、Microsoft、Oracle、IBM、NVIDIA、Arrcus） |
| 2026年10月 | OCP Global Summit：OpenAIのClustermapper、MetaのSRv6バックボーン商用運用、Alibabaのジョブ単位TE、GoogleのVirgo |

## 「AIのためのSRv6」セクションのページ（英語）

<div class="srv6-grid" markdown>

<div class="srv6-card" markdown>

### :material-lan-connect: MRCとSRv6

OpenAIとMicrosoftのスーパーコンピューターネットワークが、スタティックなuSIDソースルーティング、マルチプレーンClos、パケットスプレーをどう使っているか。

[:material-arrow-right: 詳しく読む（英語）](../ai/mrc.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-floor-plan: AIファブリックの設計

トポロジー、uSIDのアドレス計画、スタティックなスイッチテーブル、SONiCとFRRの設定、NIC側、ハードウェア、セキュリティ。

[:material-arrow-right: ファブリックを設計する（英語）](../ai/ai-fabric-design.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-compare: SRv6と他の方式の比較

ECMP、フローレット、Adaptive Routing、InfiniBand、Ultra Ethernetと、SRv6がそれらをどう補完するか。

[:material-arrow-right: 比較する（英語）](../ai/srv6-vs-ai-fabric-alternatives.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-earth: Scale-Across

複数データセンターにまたがるAI：MetaのSRv6バックボーン、Alibabaの「eCore for AI」、China Telecom、そしてSRv6ではないもの。

[:material-arrow-right: 1サイトを超える（英語）](../ai/scale-across.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-radar: AIファブリックのテレメトリー

ソースルーティングによるプロービング、Clustermapper、GPUファブリックにおけるサイレント障害（グレー障害）の検出。

[:material-arrow-right: ファブリックを観測する（英語）](../ai/ai-fabric-telemetry.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-file-document-multiple: 標準化トラッカー

IETFドラフト、OCP MRC、Ultra Ethernet、SONiC/SAI/FRRの状況を1つの表で。

[:material-arrow-right: 標準化を追う（英語）](../ai/ai-standards.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-book-alphabet: AIネットワーク用語集

All-reduce、RoCEv2、パケットスプレー、マルチプレーン、エントロピー値、uN：ネットワークエンジニア向けの定義。

[:material-arrow-right: 用語を調べる（英語）](../ai/ai-glossary.md){ .md-button }

</div>

<div class="srv6-card" markdown>

### :material-chip: AI/ML学習ネットワーク

ユースケースの概要：ECMPがGPU学習でうまくいかない理由と、SRv6の経路配置がそれをどう解決するか。

[:material-arrow-right: ユースケースを読む（英語）](../use-cases/ai-networking.md){ .md-button }

</div>

</div>

## よくある質問

### AIネットワークでSRv6は何に使われていますか？

AIネットワークでのSRv6の用途は2つあります。GPU学習クラスターの内部では、NICがSRv6のuSIDを使って、バックエンドファブリックを通るすべてのパケットの正確な経路を選びます。これによりECMPのハッシュ衝突がなくなり、スイッチはダイナミックルーティングなしで動作でき、すべての経路を検証できるようになります。データセンター間では、SRv6のトラフィックエンジニアリングが、AIトラフィックを適切な遅延と容量を持つ経路に誘導します。

### OpenAIはSRv6を使っていますか？

はい。OpenAIの最大規模のGB200学習クラスターは、スタティックなSRv6 uSIDソースルーティング上でMRC（Multipath Reliable Connection）を使っており、スイッチのダイナミックルーティングは無効化されています。OpenAI、Microsoft、AMD、Broadcom、NVIDIAが2026年5月にこの設計を公表し、OpenAIは2026年10月のOCP Global Summitで、SRv6ベースの監視システムClustermapperを発表しました。

### SRv6がAIの学習に適しているのはなぜですか？

AIの学習は少数の非常に大きな同期フローを送るため、フロー単位のハッシュでは衝突が起き、最も遅い経路がジョブ全体を遅くします。SRv6を使えば、送信側が各パケットを明示的な経路に載せ、数百本の経路にスプレーし、障害の起きた経路をマイクロ秒単位で切り離せます。スイッチはスタティックでシンプルなまま保たれ、uSIDによってオーバーヘッドは40バイトのIPv6ヘッダー1つに抑えられます。

### SRv6とUltra Ethernetの違いは何ですか？

Ultra Ethernetは、ネットワーク層を変更せずに、スイッチがハッシュするエントロピー値を使ってパケットをスプレーするトランスポートを定義しています。SRv6はネットワーク層のソースルーティング技術で、各エントロピー値を明示的な経路に対応付けることができます。両者は補完関係にあり、MRCはUltra Ethernet由来のトランスポート機能とSRv6のソースルーティングを組み合わせています。

### AIファブリック向けにSRv6をサポートしているスイッチは？

公開されている導入事例では、NVIDIA Spectrum-4とSpectrum-5（CumulusまたはSONiC）、Broadcom Tomahawk 5上のArista EOS、SONiCを動かすCisco Silicon Oneシステムが使われています。SONiCはリリース202505から、スタティックなSRv6 uSID設定をサポートしています。

### AIデータセンター間でもSRv6は使われていますか？

はい。Metaは、データセンターキャンパスとAIクラスターを相互接続するリージョナルバックボーンでSRv6のトラフィックエンジニアリングを使っています。Alibaba Cloudは、ジョブ単位のトラフィックエンジニアリングを行う、複数サイトにまたがるAI学習専用のSRv6ネットワークを運用しています。

## 参考文献

1. [Resilient AI Supercomputer Networking using MRC and SRv6](https://arxiv.org/abs/2605.04333) - OpenAI、Microsoft、AMD、Broadcom、NVIDIA、2026年5月 *（英語）*
2. [draft-filsfils-srv6ops-srv6-ai-backend](https://datatracker.ietf.org/doc/draft-filsfils-srv6ops-srv6-ai-backend/) - SRv6 for Deterministic Path Placement in AI Backends *（英語）*
3. [OCP MRC 1.0 Specification](https://www.opencompute.org/documents/ocp-mrc-1-0-pdf) - Multipath Reliable Connection *（英語）*
4. [Building resilient networks for AI supercomputers](https://techcommunity.microsoft.com/blog/azurehighperformancecomputingblog/building-resilient-networks-for-ai-supercomputers/4516919) - Microsoft Azure HPC blog *（英語）*
5. [OCP Summit 2026: Powering AI with open innovations in scale-up, scale-out and scale-across networks](https://engineering.fb.com/2026/10/12/open-source/ocp-summit-2026-powering-ai-with-open-innovations-in-scale-up-scale-out-and-scale-across-networks/) - Meta Engineering *（英語）*
6. [IPv6 & SRv6 Powering Alibaba Cloud AI Computing (IETF 125)](https://datatracker.ietf.org/meeting/125/materials/slides-125-srv6ops-21-ipv6srv6-powering-alibaba-cloud-ai-computing-alibaba-02) - Alibaba Cloud *（英語）*
7. [SONiC 202505: Powering AI fabrics](https://sonicfoundation.dev/sonic-202505-powering-ai-fabrics-and-enterprise-networks-with-precision-and-insight/) - SONiC Foundation *（英語）*
