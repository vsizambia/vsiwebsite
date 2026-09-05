import {SiteFooter,SiteHeader} from "../components/SiteChrome";

export const metadata={
  title:"Privacy Policy",
  description:"Visionary Students Initiative privacy policy and information about how personal data is handled.",
};

export default function PrivacyPolicyPage(){
  return <>
    <SiteHeader />
    <main className="legal-page">
      <article className="legal-shell">
        <p className="kicker">LEGAL &amp; PRIVACY</p>
        <h1>Privacy Policy</h1>
        <p className="legal-lead">This Privacy Policy explains how Visionary Students Initiative (VSI), a registered non-governmental organisation in Zambia, collects, uses, stores and protects personal information when you use our website, forms and online services.</p>
        <p className="legal-updated"><strong>Last updated:</strong> 5 September 2026</p>

        <h2>1. Who we are</h2>
        <p>Visionary Students Initiative (VSI) is a registered NGO in Zambia. We operate youth and student-focused programmes, volunteer activities, events, communications and related services. For privacy enquiries, contact us at <a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a> or +260 968 623 786.</p>

        <h2>2. Information we collect</h2>
        <p>Depending on how you interact with VSI, we may collect information such as your name, contact details, date of birth, education or professional information, volunteer and training information, event registration information, messages you send to us, photographs or other media you voluntarily provide, and technical information needed to operate and secure the website.</p>
        <p>We aim to collect only information that is adequate, relevant and necessary for the purpose for which it is collected.</p>

        <h2>3. How we use personal data</h2>
        <p>We may use personal data to process volunteer applications and profiles, administer programmes and events, provide training and professional development, communicate with participants and supporters, publish approved stories or media, respond to enquiries, maintain records, improve our services, prevent misuse and protect the security of our systems, and comply with legal obligations.</p>

        <h2>4. Lawful processing and consent</h2>
        <p>VSI will process personal data lawfully, fairly and transparently and for specified, legitimate purposes. Where consent is the lawful basis for processing, we will seek clear and informed consent and provide a way to withdraw it, subject to lawful exceptions and other applicable requirements.</p>

        <h2>5. Children and young people</h2>
        <p>Where we process personal data relating to children, VSI will apply appropriate safeguards and obtain parental or guardian consent where required by Zambian law. We will take reasonable steps to protect children from inappropriate collection, use or disclosure of their personal information.</p>

        <h2>6. Sharing and disclosure</h2>
        <p>VSI does not sell personal information. We may share information with service providers or partners where necessary to provide a service, administer a programme, maintain our systems or fulfil a lawful purpose. We may also disclose information where required or permitted by law. Where personal data is disclosed, we will take reasonable steps to ensure appropriate safeguards are in place.</p>

        <h2>7. Data security</h2>
        <p>We use appropriate technical and organisational safeguards intended to protect personal data against unauthorised access, loss, destruction, alteration or disclosure. No online system can be guaranteed to be completely secure, so users should also take reasonable precautions when sharing information online.</p>

        <h2>8. Retention</h2>
        <p>We retain personal information only for as long as reasonably necessary for the purpose for which it was collected, including applicable legal, accountability and record-keeping requirements. When information is no longer required, we will take reasonable steps to securely delete, anonymise or otherwise dispose of it.</p>

        <h2>9. Your rights</h2>
        <p>Subject to applicable law and any lawful limitations, you may have rights relating to access to your personal data, correction of inaccurate information, withdrawal of consent where processing is based on consent, objection to certain processing, and other rights provided by the Zambia Data Protection Act, 2021.</p>

        <h2>10. Cookies and similar technologies</h2>
        <p>VSI may use essential cookies or similar technologies required for security, authentication, session management and website functionality. Where optional analytics, marketing or other non-essential technologies are introduced, we will provide appropriate information and obtain consent where required. You can also control cookies through your browser settings.</p>

        <h2>11. Third-party services and links</h2>
        <p>Our website may contain links to third-party websites and may use third-party services to host, secure, communicate or deliver parts of our online services. Those providers may process information under their own terms and privacy policies. VSI is not responsible for the privacy practices of independent third-party websites.</p>

        <h2>12. Changes to this policy</h2>
        <p>We may update this Privacy Policy when our services, technology or legal obligations change. The latest version will be published on this page with the date of the most recent update.</p>

        <h2>13. Applicable Zambian law</h2>
        <p>This policy is intended to be read together with applicable laws of Zambia, including the <strong>Data Protection Act, 2021 (Act No. 3 of 2021)</strong>, the <strong>Electronic Communications and Transactions Act, 2021 (Act No. 4 of 2021)</strong>, the <strong>Cyber Security Act, 2025 (Act No. 3 of 2025)</strong>, and the <strong>Non-Governmental Organisations Act, 2009 (Act No. 16 of 2009), as amended</strong>, to the extent applicable to VSI and its activities.</p>
        <p>The Data Protection Act establishes principles for lawful, fair and transparent processing, security, data-subject rights and related responsibilities. The Cyber Security Act, 2025 is the current cyber-security framework and repealed and replaced the 2021 Cyber Security and Cyber Crimes Act.</p>

        <h2>14. Contact us</h2>
        <p>If you have a privacy question, wish to exercise a data protection right, or want to raise a concern about how your information is handled, contact VSI at <a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a> or +260 968 623 786.</p>

        <div className="legal-note"><strong>Important:</strong> This policy is intended as a practical website privacy notice and is not a substitute for legal advice. VSI will review it as its services, processing activities and legal obligations develop.</div>
      </article>
    </main>
    <SiteFooter />
  </>;
}
