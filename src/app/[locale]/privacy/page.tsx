import Navbar from '@/components/landing/Navbar';

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 bg-gray-50/30 dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

          <div className="prose prose-gray dark:prose-invert max-w-none space-y-6 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">1. Purpose of Processing Personal Data</h2>
              <p>AgentMarket (hereinafter &ldquo;the Company&rdquo;) processes personal data for the following purposes:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provision and operation of the Service</li>
                <li>User management and identity verification</li>
                <li>Service usage analysis and improvement</li>
                <li>Payment and refund processing (paid services)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">2. Categories of Personal Data Collected</h2>
              <p><strong>Required:</strong> Email address (upon registration)</p>
              <p><strong>Optional:</strong> Nickname, profile image</p>
              <p><strong>Automatically collected:</strong> IP address, cookies, service usage logs, access logs</p>
              <p><strong>AI conversation data:</strong> Content of conversations between users and AI Agents (for service quality improvement)</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">3. Retention and Use Period</h2>
              <p>① Personal data is destroyed without delay upon account deletion.</p>
              <p>② However, data may be retained as required by applicable law for the following periods:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Records of contracts and withdrawal of offers: 5 years (Electronic Commerce Act)</li>
                <li>Records of payment and supply of goods: 5 years (Electronic Commerce Act)</li>
                <li>Records of consumer complaints and dispute resolution: 3 years (Electronic Commerce Act)</li>
                <li>Access logs: 3 months (Protection of Communications Secrets Act)</li>
              </ul>
              <p>③ AI conversation data is retained for up to 1 year and then de-identified.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">4. Disclosure to Third Parties</h2>
              <p>The Company does not disclose personal data to third parties without user consent, except in the following cases:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>When required by law</li>
                <li>When requested by investigative authorities in accordance with legally prescribed procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">5. Outsourcing of Data Processing</h2>
              <table className="w-full border-collapse border border-gray-200 dark:border-gray-700 text-xs">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Service Provider</th>
                    <th className="border border-gray-200 dark:border-gray-700 p-2 text-left">Outsourced Tasks</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Google (Gemini API)</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">AI response generation</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Vercel Inc.</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Service hosting and infrastructure operation</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Supabase Inc.</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Database operation</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">TossPayments</td>
                    <td className="border border-gray-200 dark:border-gray-700 p-2">Payment processing</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">6. User Rights</h2>
              <p>Users may exercise the following rights at any time:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Request to access personal data</li>
                <li>Request to correct inaccurate data</li>
                <li>Request to delete data</li>
                <li>Request to suspend processing</li>
              </ul>
              <p>These rights may be exercised by contacting us at support@agentmarket.kr.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">7. Data Protection Officer</h2>
              <p>Name: Hyunwoo Lim<br />Email: support@agentmarket.kr</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">8. Security Measures</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Encryption of personal data (SSL/TLS)</li>
                <li>Access control management</li>
                <li>Retention and tamper-proofing of access logs</li>
              </ul>
            </section>

            <p className="text-gray-400 dark:text-gray-500 mt-8">Effective Date: February 3, 2026</p>
          </div>
        </div>
      </main>
    </>
  );
}
