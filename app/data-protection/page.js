import {SiteFooter,SiteHeader} from "../components/SiteChrome";

export const metadata={
  title:"Data Protection",
  description:"Visionary Students Initiative data protection information, rights and responsibilities under Zambian law.",
};

export default function DataProtectionPage(){
  return <>
    <SiteHeader />
    <main className="legal-page">
      <article className="legal-shell">
        <p className="kicker">DATA PROTECTION</p>
        <h1>Data Protection</h1>
        <p className="legal-lead">Visionary Students Initiative (VSI), a registered NGO in Zambia, is committed to responsible handling of personal data and to protecting the privacy and rights of the people who interact with our organisation.</p>
        <p className="legal-updated"><strong>Last updated:</strong> 5 September 2026</p>

        <h2>Our approach</h2>
        <p>VSI seeks to collect personal data for clear and legitimate purposes, use only what is reasonably necessary, keep information accurate, protect it against unauthorised access and retain it only as long as necessary for the relevant purpose and applicable legal requirements.</p>

        <h2>Your data protection rights</h2>
        <p>Under applicable Zambian data protection law, data subjects may have rights including access to personal data, correction of inaccurate data, withdrawal of consent where consent is the basis for processing, and other rights provided by law. Requests will be considered in accordance with the applicable legal requirements, including identity and security checks where necessary.</p>

        <h2>Children's data</h2>
        <p>Where VSI processes personal data belonging to a child, we will apply appropriate safeguards and parental or guardian consent requirements where applicable. We will also take reasonable steps to avoid collecting more information from children than is necessary for the relevant service or programme.</p>

        <h2>Security and incidents</h2>
        <p>VSI uses technical and organisational measures appropriate to the nature and risks of the information we process. If a personal-data or cyber-security incident occurs, VSI will assess it and take appropriate response, mitigation, notification and reporting steps required by applicable law.</p>

        <h2>Data processors and service providers</h2>
        <p>VSI may use trusted technology providers to host websites, store information, send communications, provide security or support online services. Where such providers process personal data on VSI's behalf, we will seek appropriate contractual, technical and organisational safeguards.</p>

        <h2>International processing</h2>
        <p>Some technology providers may process or store information outside Zambia. Where personal data is transferred or made available outside Zambia, VSI will apply the safeguards and legal requirements applicable to such processing.</p>

        <h2>Relevant Zambian legal framework</h2>
        <ul>
          <li><strong>Data Protection Act, 2021 (Act No. 3 of 2021):</strong> regulates the collection, use, transmission, storage and other processing of personal data, establishes the Office of the Data Protection Commissioner, and provides rights and duties for data subjects, controllers and processors.</li>
          <li><strong>Data Protection (Registration and Licensing) Regulations, 2021 (Statutory Instrument No. 58 of 2021):</strong> provides, among other matters, for registration categories for data controllers and processors and licensing of data auditors.</li>
          <li><strong>Electronic Communications and Transactions Act, 2021 (Act No. 4 of 2021):</strong> provides the legal framework for electronic communications and transactions and supports confidence and security in electronic services.</li>
          <li><strong>Cyber Security Act, 2025 (Act No. 3 of 2025):</strong> establishes the current Zambian cyber-security framework, including the Zambia Cyber Security Agency and provisions concerning cyber security, incidents and critical information infrastructure. It repealed and replaced the Cyber Security and Cyber Crimes Act, 2021.</li>
          <li><strong>Non-Governmental Organisations Act, 2009 (Act No. 16 of 2009), as amended:</strong> provides the framework for registration, coordination, transparency, accountability and performance of NGOs operating in Zambia.</li>
        </ul>

        <h2>Privacy enquiries and requests</h2>
        <p>For a privacy or data protection request, contact <a href="mailto:vsizambia@gmail.com">vsizambia@gmail.com</a> or +260 968 623 786. Please describe the request clearly. VSI may need to verify the identity of the requester before releasing or changing personal information.</p>

        <div className="legal-note"><strong>Legal note:</strong> This page provides general information about VSI's data protection approach and is not legal advice. Where the law changes or VSI introduces new processing activities, this information may be updated.</div>
      </article>
    </main>
    <SiteFooter />
  </>;
}
