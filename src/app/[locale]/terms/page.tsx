import Navbar from '@/components/landing/Navbar';
import { getLocale } from 'next-intl/server';

function TermsKo() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제1조 (목적)</h2>
        <p>본 이용약관은 에이전트마켓(이하 &ldquo;회사&rdquo;)이 제공하는 AI 에이전트 마켓플레이스 서비스(이하 &ldquo;서비스&rdquo;)의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제2조 (정의)</h2>
        <p>① &ldquo;서비스&rdquo;란 회사가 제공하는 AI 에이전트 기반 대화 서비스 및 관련 부가 서비스를 말합니다.</p>
        <p>② &ldquo;이용자&rdquo;란 본 약관에 따라 서비스를 이용하는 자를 말합니다.</p>
        <p>③ &ldquo;AI 에이전트&rdquo;란 인공지능 기술을 기반으로 특정 기능을 수행하는 자동화된 대화 시스템을 말합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제3조 (약관의 효력)</h2>
        <p>① 본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다.</p>
        <p>② 회사는 관련 법령에 위배되지 않는 범위에서 본 약관을 변경할 수 있으며, 변경된 약관은 제1항과 같은 방법으로 공지합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제4조 (서비스 이용)</h2>
        <p>① 이용자는 회사가 정한 절차에 따라 서비스를 이용할 수 있습니다.</p>
        <p>② 서비스는 연중무휴 24시간 제공함을 원칙으로 하나, 시스템 점검 등의 사유로 일시 중단될 수 있습니다.</p>
        <p>③ AI 에이전트의 응답은 참고용이며, 법률, 의료, 금융 등 전문 분야의 조언을 대체하지 않습니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제5조 (이용자의 의무)</h2>
        <p>이용자는 다음 행위를 해서는 안 됩니다:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>타인의 개인정보를 무단 수집 또는 이용하는 행위</li>
          <li>서비스를 이용하여 불법적인 목적의 콘텐츠를 생성하는 행위</li>
          <li>서비스의 정상적인 운영을 방해하는 행위</li>
          <li>서비스를 통해 얻은 정보를 회사의 사전 동의 없이 상업적으로 이용하는 행위</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제6조 (책임의 제한)</h2>
        <p>① 회사는 AI 에이전트가 생성한 응답의 정확성, 완전성, 적시성을 보장하지 않습니다.</p>
        <p>② AI 응답을 기반으로 한 의사결정이나 행동에 대한 책임은 이용자에게 있습니다.</p>
        <p>③ 회사는 무료 서비스의 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제7조 (유료 서비스)</h2>
        <p>① 유료 서비스의 이용 요금 및 결제 방법은 서비스 내에 별도로 명시합니다.</p>
        <p>② 결제 취소 및 환불은 관련 법령 및 회사의 정책에 따릅니다.</p>
        <p>③ 구독 해지 시 다음 결제일부터 효력이 발생합니다.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">제8조 (분쟁 해결)</h2>
        <p>본 약관에서 발생하는 분쟁은 대한민국 법률에 따르며, 회사의 본사 소재지를 관할하는 법원을 전속 관할 법원으로 합니다.</p>
      </section>
      <p className="text-gray-400 dark:text-gray-500 mt-8">시행일: 2026년 2월 3일</p>
    </div>
  );
}

function TermsEn() {
  return (
    <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 1 (Purpose)</h2>
        <p>These Terms of Service govern the rights, obligations, and responsibilities between AgentMarket (hereinafter &ldquo;the Company&rdquo;) and its users in connection with the use of the AI agent marketplace service (hereinafter &ldquo;the Service&rdquo;) provided by the Company.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 2 (Definitions)</h2>
        <p>① &ldquo;Service&rdquo; refers to the AI agent-based conversational service and related ancillary services provided by the Company.</p>
        <p>② &ldquo;User&rdquo; refers to any person who uses the Service in accordance with these Terms.</p>
        <p>③ &ldquo;AI Agent&rdquo; refers to an automated conversational system that performs specific functions based on artificial intelligence technology.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 3 (Effectiveness of Terms)</h2>
        <p>① These Terms become effective upon posting on the Service interface or by otherwise notifying users.</p>
        <p>② The Company may amend these Terms to the extent permitted by applicable law, and any amended Terms shall be notified in the same manner as described in Paragraph 1.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 4 (Use of Service)</h2>
        <p>① Users may use the Service in accordance with the procedures established by the Company.</p>
        <p>② The Service is available 24 hours a day, 365 days a year in principle; however, it may be temporarily suspended due to system maintenance or other reasons.</p>
        <p>③ Responses from AI Agents are for reference purposes only and do not constitute professional advice in areas such as law, medicine, or finance.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 5 (User Obligations)</h2>
        <p>Users shall not engage in any of the following activities:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Unauthorized collection or use of personal information of others</li>
          <li>Creation of content for illegal purposes using the Service</li>
          <li>Interference with the normal operation of the Service</li>
          <li>Commercial use of information obtained through the Service without prior consent of the Company</li>
        </ul>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 6 (Limitation of Liability)</h2>
        <p>① The Company does not guarantee the accuracy, completeness, or timeliness of responses generated by AI Agents.</p>
        <p>② Users bear full responsibility for any decisions or actions taken based on AI responses.</p>
        <p>③ The Company shall not be liable for the use of free services except as specifically required by applicable law.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 7 (Paid Services)</h2>
        <p>① Fees and payment methods for paid services are separately specified within the Service.</p>
        <p>② Payment cancellations and refunds are subject to applicable laws and Company policies.</p>
        <p>③ Subscription cancellations take effect from the next billing date.</p>
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Article 8 (Dispute Resolution)</h2>
        <p>Disputes arising from these Terms shall be governed by the laws of the Republic of Korea, and the competent court shall be the court having jurisdiction over the Company&rsquo;s principal place of business.</p>
      </section>
      <p className="text-gray-400 dark:text-gray-500 mt-8">Effective Date: February 3, 2026</p>
    </div>
  );
}

export default async function TermsPage() {
  const locale = await getLocale();
  
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50/30 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
            {locale === 'ko' ? '이용약관' : 'Terms of Service'}
          </h1>
          {locale === 'ko' ? <TermsKo /> : <TermsEn />}
        </div>
      </main>
    </>
  );
}
