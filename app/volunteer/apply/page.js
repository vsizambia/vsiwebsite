"use client";

import { useState } from "react";
import styles from "./apply.module.css";

const initialForm = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  category: "",
  skills: "",
  availability: "",
  motivation: "",
  emergencyName: "",
  emergencyPhone: "",
  consent: false,
};

const categories = [
  "Programme volunteer",
  "School-based volunteer",
  "Community volunteer",
  "Youth volunteer",
  "Technical & professional",
  "Short-term / event volunteer",
];

export default function VolunteerApplication() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    // V1 UI only: the database/admin workflow will be connected in the next build.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className={styles.page}>
        <div className={styles.successCard}>
          <span className={styles.successMark}>✓</span>
          <p className="kicker">APPLICATION RECEIVED</p>
          <h1>Thank you for your interest in VSI.</h1>
          <p>Your volunteer application has been captured for review. The next step is to connect this form to the VSI volunteer database and admin review workflow.</p>
          <a className={styles.button} href="/volunteer">Return to volunteering</a>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <a className={styles.back} href="/volunteer">← Back to volunteer information</a>
        <header className={styles.header}>
          <p className="kicker">VSI VOLUNTEER APPLICATION</p>
          <h1>Tell us how you can contribute.</h1>
          <p>Complete this short application so VSI can understand your interests, skills and availability and connect you with suitable opportunities.</p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <section className={styles.section}>
            <div className={styles.sectionIntro}>
              <span>01</span>
              <div><h2>Your details</h2><p>Basic contact information for your volunteer record.</p></div>
            </div>
            <div className={styles.grid}>
              <label>Full name *<input name="fullName" value={form.fullName} onChange={updateField} required autoComplete="name" /></label>
              <label>Email address *<input type="email" name="email" value={form.email} onChange={updateField} required autoComplete="email" /></label>
              <label>Phone number *<input type="tel" name="phone" value={form.phone} onChange={updateField} required autoComplete="tel" /></label>
              <label>Location / town *<input name="location" value={form.location} onChange={updateField} required placeholder="e.g. Lusaka" /></label>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionIntro}>
              <span>02</span>
              <div><h2>How you want to serve</h2><p>Help us understand the type of contribution that suits you.</p></div>
            </div>
            <div className={styles.grid}>
              <label>Volunteer category *<select name="category" value={form.category} onChange={updateField} required><option value="">Select a category</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label>Availability *<input name="availability" value={form.availability} onChange={updateField} required placeholder="e.g. Weekends, 5 hours/month" /></label>
              <label className={styles.full}>Skills, experience or qualifications *<textarea name="skills" value={form.skills} onChange={updateField} required rows="4" placeholder="Tell us about skills, experience, studies or professional strengths you could contribute." /></label>
              <label className={styles.full}>Why would you like to volunteer with VSI? *<textarea name="motivation" value={form.motivation} onChange={updateField} required rows="4" placeholder="A short response is enough." /></label>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionIntro}>
              <span>03</span>
              <div><h2>Emergency contact</h2><p>For volunteer safety and appropriate support.</p></div>
            </div>
            <div className={styles.grid}>
              <label>Contact name *<input name="emergencyName" value={form.emergencyName} onChange={updateField} required /></label>
              <label>Contact phone *<input type="tel" name="emergencyPhone" value={form.emergencyPhone} onChange={updateField} required /></label>
            </div>
          </section>

          <section className={styles.consent}>
            <label className={styles.checkbox}><input type="checkbox" name="consent" checked={form.consent} onChange={updateField} required /><span>I confirm that the information I have provided is accurate and I agree to VSI reviewing it for volunteer opportunities. *</span></label>
            <p>Volunteer roles may require induction, training, supervision and additional safeguarding or screening depending on the assignment.</p>
          </section>

          <button className={styles.button} type="submit">Submit volunteer application <span aria-hidden="true">→</span></button>
        </form>
      </div>
    </main>
  );
}
