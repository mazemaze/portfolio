/* ============================================================
   i18n — JA / EN dictionary + toggle
   ============================================================ */

const I18N = {
  en: {
    "nav.about": "About",
    "nav.strengths": "Strengths",
    "nav.work": "Work",
    "nav.skills": "Skills",
    "nav.experience": "Experience",
    "nav.contact": "Contact",

    "hero.kicker": "Portfolio — Tokyo / Full Remote",
    "hero.name": "Yujiro Hikawa",
    "hero.role": "AI & Full-Stack Engineer · PM · Tech Lead",
    "hero.tagline": "I take products from zero to one — and to tens of thousands of users.",
    "hero.cta.work": "See My Work",
    "hero.cta.contact": "Get in Touch",
    "hero.cta.reel": "Play showreel",
    "hero.available": "Available from October 2026",
    "contact.copy": "Copy",
    "contact.copied": "Copied",
    "contact.copyFail": "Select to copy",
    "aria.nav": "Primary",
    "aria.lang": "Language",
    "aria.menu": "Open menu",
    "aria.mobileNav": "Menu",
    "aria.radar": "Skill proficiency radar",
    "hud.scroll": "Scroll",
    "hud.top": "Top",

    "reel.title": "Showreel",
    "reel.lead": "My work in fifteen seconds.",
    "reel.watch": "Watch with sound",
    "reel.other": "日本語版",
    "reel.pause": "Pause",
    "reel.play": "Play",
    "reel.close": "Close",
    "reel.error": "The video couldn't load.",
    "reel.download": "Download it instead",
    "reel.caption": "15 sec · with sound · built in code with HTML + GSAP",

    "about.title": "About",
    "about.lead": "An engineer who ships — from requirements to release, and everything after.",
    "about.p1": "After working in contracted development and freelancing, I became the development lead and lead engineer for an app with tens of thousands of users, overseeing the engineering department while contributing to a wide range of projects on the side.",
    "about.p2": "As a full-stack engineer I work across backend, infrastructure, frontend, and mobile — covering the entire lifecycle from requirements definition and design through implementation, testing, and operations. I've also been involved in engineer hiring and mentoring, and I frequently work on Web3-related projects. I can conduct business in English.",
    "about.stat.years": "Years",
    "about.stat.projects": "Projects",
    "about.stat.industries": "Industries",
    "about.stat.users": "Users",

    "strengths.title": "Strengths",
    "strengths.lead": "Three things I bring to every project.",
    "strengths.1.title": "Full-Cycle Development",
    "strengths.1.desc": "Requirements, design, implementation, testing, operations — I carry products through every phase, solo or leading a team.",
    "strengths.2.title": "0→1 Leadership",
    "strengths.2.desc": "Multiple products launched from zero as PM and tech lead — tech selection, architecture, designer and engineer management.",
    "strengths.3.title": "AI & Frontier Tech",
    "strengths.3.desc": "LLM features, AI-assisted workflows, Web3 — new technology becomes a shipped product, fast.",

    "skills.title": "Skills",
    "skills.lead": "A full-stack toolkit, sharpened across 15+ production projects.",
    "skills.g.languages": "Languages",
    "skills.g.web": "Frameworks & Web",
    "skills.g.mobile": "Mobile",
    "skills.g.cloud": "Cloud, Data & DevOps",
    "skills.g.ai": "AI & LLMs",
    "skills.g.process": "Process & Tools",
    "skills.p.req": "Requirements",
    "skills.p.basic": "Basic Design",
    "skills.p.detail": "Detail Design",
    "skills.p.impl": "Implementation",
    "skills.p.test": "Testing",
    "skills.p.ops": "Ops & Maintenance",
    "skills.p.mgmt": "Management",
    "skills.note": "Rated A — independent execution, issue resolution, and mentoring — across the entire delivery process on my skill sheet.",
    "skills.r.l": "Languages",
    "skills.r.w": "Web",
    "skills.r.m": "Mobile",
    "skills.r.c": "Cloud",
    "skills.r.a": "AI",
    "skills.r.p": "Mgmt",

    "work.title": "Work",
    "work.lead": "Four projects, told the way clients ask about them: the challenge, what I did, and the result.",
    "work.challenge": "Challenge",
    "work.did": "What I did",
    "work.result": "Result",
    "work.1.title": "Euthopia — AI App Platform",
    "work.1.role": "Founder · Lead Engineer",
    "work.1.field": "AI · App building",
    "work.1.when": "Ongoing",
    "work.1.figure": "80+",
    "work.1.figureLabel": "Apps and sites built on it",
    "work.1.challenge": "Let people turn a conversation into a live app or landing page, with the right AI model for each job.",
    "work.1.did": "Founded Euthopia and lead its engineering: an AI platform that designs, builds, hosts and publishes apps and landing pages from a chat, and lets each job run on the model that suits it — GPT, Claude, Gemini and Chinese models such as Qwen.",
    "work.1.result": "80+ apps and sites built and published on it, on models from several providers.",
    "work.2.title": "Web3 App for the G7 in Hokkaido",
    "work.2.role": "Development Lead",
    "work.2.field": "Web3 · International event",
    "work.2.figure": "~4 mo.",
    "work.2.figureLabel": "From zero to release",
    "work.2.challenge": "Build a Web3 app for the G7 in Hokkaido, starting from zero.",
    "work.2.did": "Led development end to end: designed the data and the app, selected and managed the designer, built it and took it to release.",
    "work.2.result": "Released in about four months from a standing start.",
    "work.3.title": "AI Fitness App",
    "work.3.role": "PM · Lead Engineer",
    "work.3.field": "Fitness · AI",
    "work.3.figure": "0→1",
    "work.3.figureLabel": "Zero-to-one phase, led as PM",
    "work.3.challenge": "Take a new fitness app with AI chat and voice from zero to one.",
    "work.3.did": "Ran requirements and system design as PM. Chose and built the AI chat and voice systems on the OpenAI API, designed the whole frontend architecture, and set up the code-review process.",
    "work.3.result": "Took the app through its zero-to-one phase with AI chat and voice built in.",
    "work.4.title": "Advertising Keyboard App",
    "work.4.role": "Lead Engineer",
    "work.4.field": "Advertising · Mobile",
    "work.4.figure": "~10%",
    "work.4.figureLabel": "Rise in user retention",
    "work.4.challenge": "Keep a live app improving while running its maintenance, operations and new features.",
    "work.4.did": "Led maintenance, operations and new features, and shipped improvement proposals quickly. Built tools that made the team's work more efficient, and handled hiring, training and DevOps.",
    "work.4.result": "User retention rose by about 10%.",

    "experience.title": "Experience",
    "experience.lead": "Selected highlights from five years of shipping.",

    "exp.1.role": "Full-Stack Engineer",
    "exp.1.title": "AI Core System Development",
    "exp.1.desc": "Built the core system of an AI product across backend and frontend. Drove quality and standardization through code review, and kept implementations maintainable through spec changes.",

    "exp.2.role": "PM · Lead Engineer",
    "exp.2.title": "AI Fitness App — 0→1 Launch",
    "exp.2.desc": "Led the 0→1 launch as PM: requirements, architecture, and development. Owned the AI chat and voice systems from tech selection to implementation, plus the entire frontend architecture and review process.",

    "exp.3.role": "AI Consultant · Full-Stack",
    "exp.3.title": "AI Consulting & Development Support",
    "exp.3.desc": "Designed and built an LLM-powered coding-assist system, trained in-house engineers on AI tooling, and supported app projects with architecture proposals and reviews — raising team-wide productivity.",

    "exp.4.role": "PM · UI Designer",
    "exp.4.title": "Banking App Development",
    "exp.4.desc": "Developed a banking app in a business-English environment — implementing UI and API integrations to spec while coordinating technical specifications across teams in English chats and meetings.",

    "exp.5.role": "Lead Full-Stack Engineer",
    "exp.5.title": "Android TV & Web Platform",
    "exp.5.desc": "Led full-stack development of new Android TV features and web functionality — from requirements and design through a Go backend and React frontend.",

    "exp.6.role": "Development Lead",
    "exp.6.title": "Web3 App for G7 Summit",
    "exp.6.desc": "Shipped a Web3 app tied to the G7 summit in Hokkaido in roughly four months — from data and app design through designer selection and management, development, and launch.",

    "exp.7.role": "Lead Engineer",
    "exp.7.title": "Automotive New-Service App",
    "exp.7.desc": "Established the mobile development practice from scratch — environment setup, documentation, knowledge sharing, and tech selection — then drove web, backend, and infrastructure development.",

    "exp.8.role": "Lead Engineer",
    "exp.8.title": "Education EC App",
    "exp.8.desc": "Built a new education e-commerce app from client hearings and design through implementation, including a webhook-based Stripe payment system, while mentoring programmers on the team.",

    "contact.title": "Contact",
    "contact.line": "Let's build something.",
    "contact.text": "Open to full-remote engagements from October 2026 — from a single feature to a full product build.",
    "contact.resume": "Skill Sheet (PDF)",
    "contact.matrix": "Skill Match Sheet (◯△×, Japanese)",
    "meta.description": "Portfolio of Yujiro Hikawa — AI and full-stack engineer, PM and tech lead. Founder of the AI app platform Euthopia; 0→1 products, apps used by tens of thousands.",
  },

  ja: {
    "nav.about": "私について",
    "nav.strengths": "強み",
    "nav.work": "実績",
    "nav.skills": "スキル",
    "nav.experience": "経歴",
    "nav.contact": "お問い合わせ",

    "hero.kicker": "ポートフォリオ — 東京 / フルリモート",
    "hero.name": "ヒカワ ユウジロウ",
    "hero.role": "AI・フルスタックエンジニア · PM · テックリード",
    "hero.tagline": "0から1を生み出し、数万人に届ける。",
    "hero.cta.work": "実績を見る",
    "hero.cta.contact": "お問い合わせ",
    "hero.cta.reel": "ショーリールを再生",
    "hero.available": "2026年10月より参画可能",
    "contact.copy": "コピー",
    "contact.copied": "コピーしました",
    "contact.copyFail": "選択してコピー",
    "aria.nav": "メインメニュー",
    "aria.lang": "言語",
    "aria.menu": "メニューを開く",
    "aria.mobileNav": "メニュー",
    "aria.radar": "スキル習熟度のレーダーチャート",
    "hud.scroll": "スクロール",
    "hud.top": "トップ",

    "reel.title": "ショーリール",
    "reel.lead": "15秒でわかる、私の仕事。",
    "reel.watch": "音声付きで観る",
    "reel.other": "English version",
    "reel.pause": "一時停止",
    "reel.play": "再生",
    "reel.close": "閉じる",
    "reel.error": "動画を読み込めませんでした。",
    "reel.download": "ダウンロードして観る",
    "reel.caption": "15秒 · 音声あり · HTML + GSAP · コードで制作",

    "about.title": "私について",
    "about.lead": "要件定義からリリース、その先の運用まで。完走するエンジニア。",
    "about.p1": "受託開発とフリーランスでの業務を経て、ユーザー数が数万人を超えるアプリの開発責任者・リードエンジニアとして開発部門を統括。業務外でも多岐にわたるプロジェクトに従事してきました。",
    "about.p2": "フルスタックエンジニアとして、バックエンド・インフラ・フロントエンド・モバイル開発に携わりながら、要件定義・設計から実装・テスト・運用まで一通りを個人・チームで経験。エンジニア採用や新人教育にも関わり、Web3関連プロジェクトへの参画も多数。ビジネス英語での業務遂行も可能です。",
    "about.stat.years": "年の経験",
    "about.stat.projects": "プロジェクト",
    "about.stat.industries": "業界",
    "about.stat.users": "ユーザー",

    "strengths.title": "強み",
    "strengths.lead": "すべてのプロジェクトに持ち込む、3つの武器。",
    "strengths.1.title": "フルサイクル開発",
    "strengths.1.desc": "要件定義・設計から実装・テスト・運用まで。一人でも、チームのリードとしてでも、すべての工程を完走できます。",
    "strengths.2.title": "0→1立ち上げ・リーダーシップ",
    "strengths.2.desc": "PM・テックリードとして複数のプロダクトをゼロから立ち上げ。技術選定・アーキテクチャ設計からデザイナー・エンジニアのマネジメントまで主導。",
    "strengths.3.title": "AI・先端技術",
    "strengths.3.desc": "LLM活用機能、AI支援ワークフロー、Web3。新しい技術をいち早くプロダクトという形にします。",

    "skills.title": "スキル",
    "skills.lead": "15以上の本番プロジェクトで磨かれた、フルスタックの武器庫。",
    "skills.g.languages": "言語",
    "skills.g.web": "フレームワーク・Web",
    "skills.g.mobile": "モバイル",
    "skills.g.cloud": "クラウド・データ・DevOps",
    "skills.g.ai": "AI・LLM",
    "skills.g.process": "工程・ツール",
    "skills.p.req": "要件定義",
    "skills.p.basic": "基本設計",
    "skills.p.detail": "詳細設計",
    "skills.p.impl": "実装",
    "skills.p.test": "テスト",
    "skills.p.ops": "保守・運用",
    "skills.p.mgmt": "マネジメント",
    "skills.note": "スキルシート上、要件定義から保守運用・マネジメントまで全工程でA評価（業務の独力遂行・課題解決・後進教育）。",
    "skills.r.l": "言語",
    "skills.r.w": "Web",
    "skills.r.m": "モバイル",
    "skills.r.c": "クラウド",
    "skills.r.a": "AI",
    "skills.r.p": "管理",

    "work.title": "実績",
    "work.lead": "4つのプロジェクトを、課題・取り組み・結果で紹介します。",
    "work.challenge": "課題",
    "work.did": "取り組み",
    "work.result": "結果",
    "work.1.title": "Euthopia — AIアプリ構築プラットフォーム",
    "work.1.role": "創業者・リードエンジニア",
    "work.1.field": "AI・アプリ構築",
    "work.1.when": "継続中",
    "work.1.figure": "80+",
    "work.1.figureLabel": "構築されたアプリ・サイト",
    "work.1.challenge": "会話だけで、アプリやランディングページを公開まで。仕事ごとに最適なAIモデルを使えるようにする。",
    "work.1.did": "Euthopiaを創業し、開発をリード。会話からアプリやLPを設計・構築・ホスティング・公開まで行うAIプラットフォームで、GPT・Claude・Gemini、Qwenなどの中国系モデルを含む複数のAIモデルを、仕事ごとに選べる設計に。",
    "work.1.result": "80以上のアプリ・サイトが、複数プロバイダーのAIモデルで構築・公開されている。",
    "work.2.title": "北海道G7向けWeb3アプリ",
    "work.2.role": "開発統括",
    "work.2.field": "Web3・国際会議",
    "work.2.figure": "約4ヶ月",
    "work.2.figureLabel": "ゼロからリリースまで",
    "work.2.challenge": "北海道G7に向けたWeb3アプリを、ゼロから開発する。",
    "work.2.did": "開発統括として、データ設計・アプリ設計、デザイナーの選定とマネジメント、開発、リリースまでを一貫して担当。",
    "work.2.result": "着手から約4ヶ月でリリースまで完遂。",
    "work.3.title": "AIフィットネスアプリ",
    "work.3.role": "PM・リードエンジニア",
    "work.3.field": "フィットネス・AI",
    "work.3.figure": "0→1",
    "work.3.figureLabel": "PMとして0→1フェーズを主導",
    "work.3.challenge": "AIチャットと音声機能を持つ新しいフィットネスアプリを、ゼロから立ち上げる。",
    "work.3.did": "PMとして要件定義・システム設計を主導。OpenAI APIを使ったAIチャット・音声システムを技術選定から実装まで担当し、フロントエンド全体のアーキテクチャ設計とレビュー体制を構築。",
    "work.3.result": "AIチャット・音声を組み込み、アプリを0→1フェーズまで立ち上げ。",
    "work.4.title": "広告業界 キーボードアプリ",
    "work.4.role": "リードエンジニア",
    "work.4.field": "広告・モバイル",
    "work.4.figure": "約10%",
    "work.4.figureLabel": "ユーザー継続率の上昇",
    "work.4.challenge": "運用中のアプリを保守・運用しながら、継続的に改善する。",
    "work.4.did": "リードとして保守・運用・追加機能開発を担当し、改善提案を素早くプロダクトに反映。業務効率化ツールを開発し、採用・教育・DevOpsも担当。",
    "work.4.result": "ユーザー継続率が約10%上昇。",

    "experience.title": "経歴",
    "experience.lead": "5年間の開発経験から、厳選したハイライト。",

    "exp.1.role": "フルスタックエンジニア",
    "exp.1.title": "AI基幹システム開発",
    "exp.1.desc": "AIプロダクトの基幹システムをバックエンド・フロントエンド双方で開発。コードレビューを通じて品質向上と開発標準化に貢献し、仕様変更時も保守性を考慮した実装を実施。",

    "exp.2.role": "PM・リードエンジニア",
    "exp.2.title": "AIフィットネスアプリ — 0→1立ち上げ",
    "exp.2.desc": "PMとして0→1フェーズの立ち上げを主導。要件定義・システム設計・開発を担当し、AIチャット・音声システムの技術選定から実装まで一貫して担当。フロントエンド全体のアーキテクチャ設計とレビュー体制も構築。",

    "exp.3.role": "AIコンサル・フルスタック",
    "exp.3.title": "AIコンサルティング・開発支援",
    "exp.3.desc": "LLM活用のコーディング支援システムを設計・開発し、社内エンジニアへのAI活用研修を実施。アプリ開発プロジェクトへの技術支援・レビューを通じ、チーム全体の生産性向上に貢献。",

    "exp.4.role": "PM・UIデザイナー",
    "exp.4.title": "バンクアプリ開発",
    "exp.4.desc": "ビジネス英語環境でのバンクアプリ開発。仕様書に沿ったUI・API連携の実装を担当し、英語でのチャット・会議を通じて各チームと技術仕様を策定。",

    "exp.5.role": "リード・フルスタックエンジニア",
    "exp.5.title": "Android TV・Webプラットフォーム開発",
    "exp.5.desc": "Android TVの機能開発とWeb新機能開発をリード。要件定義・設計からGo製バックエンド、Reactフロントエンドまでフルスタックで担当。",

    "exp.6.role": "開発統括",
    "exp.6.title": "G7サミット向けWeb3アプリ",
    "exp.6.desc": "北海道G7に向けたWeb3アプリを約4ヶ月でゼロから開発。データ設計・アプリ設計からデザイナー選定・マネジメント、開発、リリースまでを完遂。",

    "exp.7.role": "リードエンジニア",
    "exp.7.title": "自動車業界 新規サービスアプリ",
    "exp.7.desc": "モバイルエンジニアがいない環境で、開発環境整備・ドキュメント化・知識共有・技術選定を行い基盤を構築。その後Web・バックエンド・インフラ開発まで従事。",

    "exp.8.role": "リードエンジニア",
    "exp.8.title": "教育系ECアプリ開発",
    "exp.8.desc": "顧客へのヒアリング・デザインから実装まで、新規教育系ECアプリを開発。Webhookを用いたStripe決済システムを構築し、プログラマーの教育も担当。",

    "contact.title": "お問い合わせ",
    "contact.line": "一緒に作りましょう。",
    "contact.text": "2026年10月よりフルリモートで参画可能です。一機能からプロダクト全体の開発まで、お気軽にご相談ください。",
    "contact.resume": "スキルシート (PDF)",
    "contact.matrix": "スキルマッチ早見表（◯△×）",
    "meta.description": "ヒカワ ユウジロウのポートフォリオ — AI・フルスタックエンジニア / PM / テックリード。AIアプリ構築プラットフォーム「Euthopia」創業者。0→1プロダクト、数万人規模のアプリ開発。",
  },
};

(function () {
  const STORAGE_KEY = "lang";
  const html = document.documentElement;
  const buttons = document.querySelectorAll(".lang-toggle button");

  function detect() {
    const param = new URLSearchParams(location.search).get("lang");
    if (param === "ja" || param === "en") return param;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ja" || saved === "en") return saved;
    return "ja";
  }

  function swap(lang) {
    const dict = I18N[lang];
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.getAttribute("data-i18n-aria");
      if (dict[key] != null) el.setAttribute("aria-label", dict[key]);
    });
    html.setAttribute("lang", lang);
    document.title =
      lang === "ja"
        ? "ヒカワ ユウジロウ — AI・フルスタックエンジニア"
        : "Yujiro Hikawa — AI & Full-Stack Engineer";
    const desc = dict["meta.description"];
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && desc) metaDesc.setAttribute("content", desc);
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", document.title);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && desc) ogDesc.setAttribute("content", desc);
    pauseHiddenReels();
    buttons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    localStorage.setItem(STORAGE_KEY, lang);
    document.dispatchEvent(new CustomEvent("i18n:change", { detail: { lang, dict } }));
  }

  // Both showreel versions are in the page and CSS shows the one for the page language.
  // Pause whichever is hidden, also when something else (e.g. a translation extension)
  // rewrites <html lang>.
  function pauseHiddenReels() {
    document.querySelectorAll(".reel-video").forEach((v) => {
      if (getComputedStyle(v).display === "none") v.pause();
    });
  }
  new MutationObserver(pauseHiddenReels).observe(html, { attributes: true, attributeFilter: ["lang"] });

  function apply(lang, instant) {
    const main = document.querySelector("main");
    if (instant || !main) {
      swap(lang);
      return;
    }
    main.classList.add("fading");
    setTimeout(() => {
      swap(lang);
      main.classList.remove("fading");
    }, 160);
  }

  buttons.forEach((b) => b.addEventListener("click", () => apply(b.dataset.lang, false)));

  apply(detect(), true);
})();
