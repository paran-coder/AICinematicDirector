import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/app-shell";

export const metadata: Metadata = {
  title: "사용법",
  description: "AI Cinematic Director에서 프로젝트를 만들고 캐릭터, 장면, 샷을 구성한 뒤 영상을 생성하는 전체 작업 흐름 안내",
  alternates: {
    canonical: "/guide",
  },
};

const navItems = [
  ["quick-start", "빠른 시작"],
  ["project", "1. 프로젝트"],
  ["character", "2. 캐릭터"],
  ["scene", "3. 장면"],
  ["shot", "4. 샷 연출"],
  ["consistency", "5. 일관성 검사"],
  ["generate", "6. 영상 생성"],
  ["autosave", "저장과 상태"],
  ["backup", "백업과 복원"],
  ["prompt", "프롬프트 보기"],
  ["troubleshooting", "문제 해결"],
] as const;

function GuideSection({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="guide-section" id={id}>
      <span className="guide-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function GuidePage() {
  return (
    <AppShell active="guide" crumbs={["사용법"]} showAspect={false}>
      <main className="guide-stage">
        <div className="guide-layout">
          <aside className="guide-nav" aria-label="사용법 목차">
            <strong>사용법</strong>
            <nav>
              {navItems.map(([id, label]) => (
                <a key={id} href={`#${id}`}>{label}</a>
              ))}
            </nav>
            <Link className="guide-back-link" href="/projects/demo/shots/shot-02">샷 화면으로 돌아가기 →</Link>
          </aside>

          <article className="guide-article">
            <header className="guide-hero">
              <span className="guide-eyebrow">AI CINEMATIC DIRECTOR</span>
              <h1>아이디어에서 생성 영상까지</h1>
              <p>
                이 페이지는 AI Cinematic Director의 전체 작업 흐름을 설명합니다.
                사용자는 창작 결정을 내리고, 시스템은 장면과 샷의 구조화·일관성 검사·프롬프트 컴파일을 처리합니다.
              </p>
              <div className="guide-flow" aria-label="전체 작업 흐름">
                <span>프로젝트</span><b>→</b><span>캐릭터</span><b>→</b><span>장면</span><b>→</b><span>샷</span><b>→</b><span>생성</span>
              </div>
            </header>

            <GuideSection id="quick-start" eyebrow="QUICK START" title="가장 빠른 작업 순서">
              <div className="guide-step-grid">
                <article><span>01</span><strong>이야기 입력</strong><p>만들고 싶은 영상의 핵심 상황과 분위기를 자연어로 입력합니다.</p></article>
                <article><span>02</span><strong>캐릭터 확정</strong><p>얼굴·헤어·체형·고유 특징을 확인하고 영상 전체의 기준 모습을 정합니다.</p></article>
                <article><span>03</span><strong>장면 확인</strong><p>장소, 등장인물, 소품, 시간대, 날씨와 상태 변화를 확인합니다.</p></article>
                <article><span>04</span><strong>샷 연출</strong><p>행동, 표정, 시선, 샷 크기, 카메라 움직임과 조명을 결정합니다.</p></article>
                <article><span>05</span><strong>일관성 확인</strong><p>캐릭터·의상·장소·소품·스타일의 연결이 자연스러운지 확인합니다.</p></article>
                <article><span>06</span><strong>생성·선택</strong><p>영상을 생성하고 여러 버전 중 사용할 결과를 선택하거나 샷을 다시 조정합니다.</p></article>
              </div>
            </GuideSection>

            <GuideSection id="project" eyebrow="PROJECT" title="1. 프로젝트 — 이야기의 기준을 만듭니다">
              <p>
                프로젝트 화면은 모든 작업의 시작점입니다. 한두 문장만 입력해도 되지만,
                인물·공간·행동·분위기를 함께 적으면 이후 장면과 샷을 더 명확하게 구성할 수 있습니다.
              </p>
              <div className="guide-example">
                <strong>입력 예시</strong>
                <p>비 오는 서울의 밤. Mina가 오래된 상점에 들어가 카세트 플레이어를 발견하고 잊고 있던 기억을 떠올린다.</p>
              </div>
              <div className="guide-info-grid">
                <article><strong>영상 길이</strong><p>전체 영상의 목표 길이입니다. 이후 장면과 샷의 길이를 나누는 기준이 됩니다.</p></article>
                <article><strong>화면 비율</strong><p>기본 프레임 비율입니다. 프로젝트 전체에서 동일한 비율을 사용하는 것을 권장합니다.</p></article>
                <article><strong>장르</strong><p>드라마, 스릴러, 광고 등 이야기의 연출 방향을 설명합니다.</p></article>
                <article><strong>비주얼 방향</strong><p>색감, 시대감, 질감, 촬영 분위기처럼 프로젝트 전체가 공유할 시각 언어입니다.</p></article>
              </div>
            </GuideSection>

            <GuideSection id="character" eyebrow="CHARACTER" title="2. 캐릭터 — 바뀌지 않아야 할 모습을 확정합니다">
              <p>
                캐릭터 화면에서 영상 전체에 반복해서 등장할 인물의 기준을 확인합니다.
                얼굴 형태, 머리, 체형, 눈 색, 고유 특징처럼 인물의 정체성을 구성하는 항목은 프로젝트 전체에서 보호됩니다.
              </p>
              <div className="guide-callout">
                <strong>캐릭터 State와 Identity는 다릅니다.</strong>
                <p>젖음, 피곤함, 부상, 의상 변경은 같은 인물의 상태 변화입니다. 새로운 캐릭터를 다시 만드는 것이 아닙니다.</p>
              </div>
              <p>
                장면이 진행되면서 상태가 바뀌어야 할 때는 State를 사용합니다.
                예를 들어 비를 맞은 뒤 실내에 들어와도 캐릭터의 젖은 상태는 자연스럽게 이어질 수 있습니다.
              </p>
            </GuideSection>

            <GuideSection id="scene" eyebrow="SCENE" title="3. 장면 — 이야기의 연속성을 확인합니다">
              <p>
                장면 화면에서는 이야기의 순서와 각 장면이 사용하는 캐릭터, 장소, 소품, 시간대, 날씨, 조명과 분위기를 확인합니다.
                장면을 클릭하면 해당 장면의 문맥이 바뀌고, 그 문맥을 기준으로 샷이 만들어집니다.
              </p>
              <div className="guide-info-grid">
                <article><strong>캐릭터</strong><p>이 장면에 실제로 등장하는 인물과 현재 상태를 확인합니다.</p></article>
                <article><strong>장소</strong><p>공간의 구조와 시각적 기준은 프로젝트 전체에서 가능한 한 유지됩니다.</p></article>
                <article><strong>소품</strong><p>반복해서 등장하는 핵심 소품의 디자인과 상태를 확인합니다.</p></article>
                <article><strong>환경</strong><p>날씨, 시간대, 조명처럼 장면 단위로 바뀔 수 있는 조건을 설정합니다.</p></article>
              </div>
              <p>
                이전 장면과 상태가 갑자기 달라지는 경우 시스템이 확인이 필요한 항목으로 표시할 수 있습니다.
                의도한 변화라면 현재 상태를 사용하고, 실수라면 이전 상태를 유지합니다.
              </p>
            </GuideSection>

            <GuideSection id="shot" eyebrow="SHOT" title="4. 샷 — 실제 촬영처럼 연출합니다">
              <p>
                샷 화면은 가장 많이 사용하는 작업 공간입니다. 왼쪽에서 샷을 선택하고,
                가운데에서 첫 프레임 또는 생성 결과를 확인하며, 오른쪽에서 연기·카메라·조명을 조정합니다.
              </p>
              <div className="guide-shot-map">
                <div><span>왼쪽</span><strong>샷 목록</strong><p>샷 순서, 종류, 길이와 내용을 빠르게 이동합니다.</p></div>
                <div><span>가운데</span><strong>미리보기</strong><p>첫 프레임과 생성 결과를 분리해서 확인합니다.</p></div>
                <div><span>오른쪽</span><strong>연출 설정</strong><p>행동, 표정, 시선, 카메라, 조명과 환경을 편집합니다.</p></div>
              </div>
              <h3>첫 프레임과 생성 결과</h3>
              <p>
                <strong>첫 프레임</strong>은 생성 전에 구도와 캐릭터·장소·소품의 일관성을 확인하는 기준 이미지입니다.
                <strong> 생성 결과</strong>는 실제 생성된 영상을 재생하고 프레임 흐름을 확인하는 영역입니다.
              </p>
              <h3>연출 설정</h3>
              <div className="guide-info-grid">
                <article><strong>연기</strong><p>행동, 표정, 시선을 정합니다. 한 샷 안에서 관객이 무엇을 느껴야 하는지 먼저 결정하세요.</p></article>
                <article><strong>카메라</strong><p>샷 크기, 카메라 움직임, 앵글을 정합니다. 필요하면 고급 설정에서 렌즈·초점·흔들림을 조정합니다.</p></article>
                <article><strong>조명과 환경</strong><p>기본 조명, 보조 조명, 시간대, 날씨를 정합니다. 장면 기준과 다르면 확인 경고가 나타날 수 있습니다.</p></article>
                <article><strong>샷 메타</strong><p>미리보기 아래에서 길이, fps, 샷 크기, 렌즈, 앵글과 카메라 움직임을 한 번에 확인합니다.</p></article>
              </div>
            </GuideSection>

            <GuideSection id="consistency" eyebrow="CONSISTENCY" title="5. 일관성 검사 — 문제만 보여줍니다">
              <p>
                정상 상태에서는 일관성 검사가 한 줄로 작게 표시됩니다.
                문제가 있을 때만 상세 내용이 펼쳐지므로 모든 항목을 매번 직접 확인할 필요가 없습니다.
              </p>
              <div className="guide-status-grid">
                <article className="is-success"><strong>정상</strong><p>캐릭터, 의상, 장소, 소품, 스타일이 현재 문맥과 일치합니다.</p></article>
                <article className="is-warning"><strong>확인 필요</strong><p>의상, 날씨, 시간대처럼 의도에 따라 바뀔 수 있는 항목입니다. 생성은 계속할 수 있습니다.</p></article>
                <article className="is-danger"><strong>자동 복원 / 차단</strong><p>캐릭터의 기준 Identity처럼 바뀌면 안 되는 값은 기준값으로 되돌리거나 생성을 막습니다.</p></article>
              </div>
              <div className="guide-callout">
                <strong>예: 비가 그쳤다고 캐릭터가 즉시 마르는 것은 아닙니다.</strong>
                <p>환경 조건과 캐릭터 상태는 별개로 관리되므로 젖은 상태가 다음 샷까지 자연스럽게 이어질 수 있습니다.</p>
              </div>
            </GuideSection>

            <GuideSection id="generate" eyebrow="GENERATE" title="6. 생성 — 결과를 만들고 비교합니다">
              <p>
                샷 연출과 일관성 확인이 끝나면 <strong>이 샷 생성</strong>을 누릅니다.
                생성 화면에서는 대기, 생성 중, 완료, 실패 상태를 확인하고 결과 버전을 비교할 수 있습니다.
              </p>
              <div className="guide-loop">
                <span>샷 조정</span><b>→</b><span>영상 생성</span><b>→</b><span>결과 확인</span><b>→</b><span>채택 / 재생성 / 다시 수정</span>
              </div>
              <h3>결과가 마음에 들지 않을 때</h3>
              <p>
                <strong>같은 연출로 다시 생성</strong>하면 현재 설정을 유지한 채 새로운 버전을 만듭니다.
                연기나 카메라 자체를 바꾸고 싶다면 <strong>샷 수정</strong>으로 돌아간 뒤 다시 생성합니다.
              </p>
              <p>
                여러 결과가 만들어졌다면 사용할 버전을 하나 선택합니다.
                이전 결과는 삭제하지 않고 비교 가능한 버전으로 남길 수 있습니다.
              </p>
            </GuideSection>

            <GuideSection id="autosave" eyebrow="SAVE" title="저장과 상태 표시">
              <p>
                프로젝트와 샷 편집 내용은 입력을 멈춘 뒤 자동으로 저장됩니다.
                별도의 저장 버튼을 계속 누를 필요가 없습니다.
              </p>
              <div className="guide-status-list">
                <div><code>저장 중...</code><p>변경 내용을 이 브라우저의 IndexedDB에 기록하고 있습니다.</p></div>
                <div><code>이 브라우저에 저장됨</code><p>현재 변경 사항이 이 기기의 현재 브라우저에 저장되었습니다.</p></div>
                <div><code>저장하지 못했습니다</code><p>네트워크 또는 서버 문제가 있습니다. 입력한 내용은 화면에 유지되며 다시 시도할 수 있습니다.</p></div>
                <div><code>저장하지 못했습니다</code><p>브라우저 저장 공간을 사용할 수 없거나 저장 중 오류가 발생했습니다. JSON 백업을 만들어 두는 것을 권장합니다.</p></div>
              </div>
            </GuideSection>


            <GuideSection id="backup" eyebrow="LOCAL FIRST" title="백업과 복원 — 서버 계정 없이 프로젝트를 옮깁니다">
              <p>
                v1.0.0은 별도의 외부 데이터베이스 계정을 사용하지 않습니다. 프로젝트와 샷 편집값, 생성 기록은
                브라우저의 <strong>IndexedDB</strong>에 저장됩니다.
              </p>
              <div className="guide-callout">
                <strong>중요: 로컬 저장은 현재 브라우저에만 존재합니다.</strong>
                <p>다른 컴퓨터나 다른 브라우저에는 자동으로 동기화되지 않으며, 브라우저의 사이트 데이터를 삭제하면 함께 지워질 수 있습니다.</p>
              </div>
              <p>
                프로젝트 화면의 <strong>백업 내보내기</strong>를 누르면 편집 데이터를 JSON 파일로 저장할 수 있습니다.
                다른 환경에서는 <strong>백업 가져오기</strong>로 같은 프로젝트의 데이터를 복원할 수 있습니다.
                영상 파일 자체는 JSON에 포함되지 않고 생성 결과 URL과 메타데이터만 기록됩니다.
              </p>
            </GuideSection>

            <GuideSection id="prompt" eyebrow="ADVANCED" title="프롬프트는 필요할 때만 봅니다">
              <p>
                일반적인 작업에서는 프롬프트를 직접 작성할 필요가 없습니다.
                시스템이 캐릭터, 장소, 소품, 스타일과 현재 샷의 연출값을 조합해 생성용 프롬프트를 만듭니다.
              </p>
              <p>
                확인이 필요할 때는 샷 오른쪽 상단의 <strong>••• → 프롬프트 보기</strong>를 사용합니다.
                이 화면은 보조 정보이며, 최종 생성 시에는 일관성 검사 결과를 기준으로 서버에서 다시 컴파일됩니다.
              </p>
            </GuideSection>

            <GuideSection id="troubleshooting" eyebrow="HELP" title="문제가 생겼을 때">
              <div className="guide-faq">
                <details><summary>수정 내용이 사라졌습니다.</summary><p>동일한 브라우저와 동일한 사이트 주소인지 확인하세요. 브라우저 사이트 데이터를 삭제했거나 다른 기기에서 접속한 경우 로컬 데이터가 보이지 않습니다. 프로젝트 화면의 JSON 백업이 있다면 가져오기로 복원할 수 있습니다.</p></details>
                <details><summary>캐릭터 외형을 바꿨는데 다시 원래대로 돌아옵니다.</summary><p>프로젝트 전체의 기준 Identity로 보호되는 항목일 수 있습니다. 장면 변화가 필요하다면 새 캐릭터가 아니라 State나 장면 범위 설정을 사용하세요.</p></details>
                <details><summary>첫 프레임에서는 영상이 재생되지 않습니다.</summary><p>정상입니다. 첫 프레임은 생성 전 기준 이미지입니다. 생성된 영상은 ‘생성 결과’ 탭에서 확인합니다.</p></details>
                <details><summary>같은 설정인데 생성 결과가 다릅니다.</summary><p>생성 모델은 같은 연출에서도 미세한 변형을 만들 수 있습니다. 결과를 버전으로 비교하고 가장 적합한 결과를 선택하세요.</p></details>
                <details><summary>일관성 경고가 나와도 생성할 수 있나요?</summary><p>‘확인 필요’는 생성 가능한 경고입니다. 반면 기준 Identity를 깨는 충돌은 자동 복원되거나 차단될 수 있습니다.</p></details>
              </div>
            </GuideSection>

            <footer className="guide-footer">
              <div>
                <strong>권장 작업 방식</strong>
                <p>한 번에 모든 것을 완벽하게 만들기보다, 장면을 확인하고 샷 하나씩 생성·비교·수정하는 짧은 반복을 권장합니다.</p>
              </div>
              <Link className="primary-link guide-primary-link" href="/projects/demo/shots/shot-02">샷 연출 시작하기 →</Link>
            </footer>
          </article>
        </div>
      </main>
    </AppShell>
  );
}
