import { useEffect, type ComponentType, type SVGProps } from "react";
import backdrop from "./assets/login-backdrop.webp";
import illustration from "./assets/hero-illustration.webp";
import illustration2x from "./assets/hero-illustration@2x.webp";
import { BoltIcon, CubeIcon, GithubIcon, GraphIcon, T3Mark } from "./components/icons";
import { LoginCard } from "./components/LoginCard";

type Feature = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconClassName: string;
  tileClassName: string;
};

const FEATURES: Feature[] = [
  {
    title: "智能上下文",
    description: "延续开发思路，告别重复",
    Icon: BoltIcon,
    iconClassName: "h-38 w-28",
    tileClassName: "bg-tile",
  },
  {
    title: "多 Agent 协作",
    description: "更强的编码助手阵容",
    Icon: CubeIcon,
    iconClassName: "h-40 w-36",
    tileClassName: "bg-tile-deep",
  },
  {
    title: "代码知识图谱",
    description: "深入理解项目，精准回答",
    Icon: GraphIcon,
    iconClassName: "h-36 w-38",
    tileClassName: "bg-tile-violet",
  },
];

const OFFICIAL_URL = "https://t3.codes/";

export default function App() {
  useEffect(() => {
    document.title = "登录 · T3 Code";
    document.documentElement.lang = "zh-CN";
  }, []);

  return (
    <main lang="zh-CN" className="relative isolate min-h-dvh overflow-hidden font-sans text-ink">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-canvas bg-cover bg-[position:30%_center] desk:bg-center"
        style={{ backgroundImage: `url(${backdrop})` }}
      />

      <div className="mx-auto flex min-h-dvh w-full max-w-480 flex-col px-20 pb-24 pt-28 sm:max-w-560 sm:px-32 sm:pt-40 desk:max-w-none desk:items-center desk:justify-center desk:p-0">
        {/* Desktop stage: a 1672 × 941 design canvas measured in rem-based design pixels. */}
        <div className="flex flex-1 flex-col desk:relative desk:block desk:h-941 desk:w-1672 desk:flex-none">
          <Brand />
          <img
            src={illustration}
            srcSet={`${illustration} 1x, ${illustration2x} 2x`}
            alt=""
            width={552}
            height={630}
            decoding="async"
            draggable={false}
            className="pointer-events-none hidden select-none desk:absolute desk:left-460 desk:top-212 desk:block desk:h-630 desk:w-552"
          />
          <div className="flex flex-1 flex-col justify-center py-8 desk:contents">
            <Hero />
            <LoginCard />
          </div>
          <SiteFooter />
        </div>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <a
      href="/"
      aria-label="T3 Code 首页"
      className="flex w-fit items-center gap-12 rounded-field desk:absolute desk:left-82 desk:top-59.75 desk:gap-18.25"
    >
      <T3Mark preserveAspectRatio="none" className="h-34 w-48 desk:h-54 desk:w-76.75" />
      <span className="text-24 font-bold leading-none tracking-[-0.01em] text-ink desk:-mt-6 desk:text-43 desk:tracking-normal">
        T3 Code
      </span>
    </a>
  );
}

function Hero() {
  return (
    <section
      aria-label="T3 Code 简介"
      className="mt-32 sm:mt-40 desk:absolute desk:left-80 desk:top-201 desk:mt-0"
    >
      <p className="hidden text-82 font-bold leading-none tracking-[-0.01em] text-ink desk:block">
        T3 Code
      </p>
      <p className="text-30 font-bold leading-[1.15] tracking-[-0.02em] text-ink sm:text-36 desk:ml-1 desk:mt-0 desk:text-slogan desk:leading-none desk:tracking-[0.017em]">
        让{" "}
        <span className="inline-block -skew-x-10 text-38 leading-none tracking-normal text-brand sm:text-44 desk:ml-2.5 desk:translate-y-3.75 desk:text-80">
          AI
        </span>{" "}
        更懂你的代码
      </p>
      <p className="mt-10 flex items-center text-15 font-medium leading-none tracking-[-0.01em] text-ink-2 sm:mt-14 sm:text-17 desk:ml-3 desk:mt-32.5 desk:text-28 desk:font-[450] desk:tracking-[-0.025em]">
        跨会话记忆
        <Separator />
        智能协作
        <Separator />
        高效开发
      </p>

      <ul
        aria-label="核心能力"
        className="hidden desk:-ml-1 desk:mt-49 desk:flex desk:flex-col desk:gap-21.5"
      >
        {FEATURES.map(({ title, description, Icon, iconClassName, tileClassName }) => (
          <li key={title} className="flex items-center gap-24">
            <span
              className={`grid size-72 shrink-0 place-items-center rounded-tile text-brand ${tileClassName}`}
            >
              <Icon className={iconClassName} />
            </span>
            <span className="flex flex-col pt-8">
              <span className="text-23 font-[550] leading-none tracking-[-0.02em] text-ink">
                {title}
              </span>
              <span className="mt-12 text-19 font-[450] leading-none tracking-[-0.02em] text-ink-3">
                {description}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Separator() {
  return (
    <>
      <span
        aria-hidden="true"
        className="mx-8 inline-block size-3 shrink-0 rounded-full bg-current desk:ml-14.5 desk:mr-15.5 desk:size-5 desk:translate-y-1"
      />
      <span className="sr-only">，</span>
    </>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-auto flex items-center justify-center pt-28 text-13 text-footer desk:absolute desk:left-80 desk:top-853 desk:mt-0 desk:justify-start desk:pt-0 desk:text-18">
      <GithubIcon className="size-16 desk:size-25" />
      <span className="ml-8 font-medium tracking-[-0.02em] desk:ml-11 desk:font-[450]">
        开源社区
      </span>
      <span
        aria-hidden="true"
        className="mx-10 h-12 w-px bg-current opacity-70 desk:ml-14.5 desk:mr-17 desk:h-16"
      />
      <a
        href={OFFICIAL_URL}
        target="_blank"
        rel="noreferrer"
        className="rounded-[0.25rem] font-medium transition-colors hover:text-brand desk:relative desk:-top-1 desk:text-17"
      >
        {OFFICIAL_URL}
      </a>
    </footer>
  );
}
