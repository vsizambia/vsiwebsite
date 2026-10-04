"use client";

import { useState } from "react";
import Image from "next/image";

const sections = [
  {
    id: "who-we-are",
    cardTitle: "Who We Are",
    cardDescription: "Our mission, values and the people behind VSI.",
    eyebrow: "VISIONARY STUDENTS INITIATIVE",
    title: <>Students at the centre of <em>national development.</em></>,
    description: "We promote policies and initiatives that give young people the knowledge, voice, skills and opportunities to participate meaningfully in Zambia’s future.",
    image: "/images/vsi-parliament.jpg",
    thumb: "/images/vsi what we stand on 1.jpg",
    alt: "Students participating in a civic engagement activity",
    learnMore: "/discover",
  },
  {
    id: "vsi-in-action",
    cardTitle: "VSI in Action",
    cardDescription: "Projects, programmes and real change in communities.",
    eyebrow: "LEARNING. LEADERSHIP. ACTION.",
    title: <>Young people turning ideas into <em>meaningful action.</em></>,
    description: "From school-based initiatives to community engagement, we create opportunities for young people to learn, lead and make a practical difference.",
    image: "/images/cleaning programme.jpg",
    thumb: "/images/cleaning programme1.jpg",
    alt: "VSI volunteers taking part in a community activity",
    learnMore: "/projects",
  },
  {
    id: "impact",
    cardTitle: "Impact & Evidence",
    cardDescription: "Our progress, outcomes and what we’ve learned.",
    eyebrow: "EVIDENCE THAT INSPIRES CHANGE",
    title: <>Real work. Shared learning. <em>Lasting impact.</em></>,
    description: "Explore VSI projects, the people they reach and the lessons that help strengthen youth participation and community-led change.",
    image: "/images/research.JPG",
    thumb: "/images/research.JPG",
    alt: "VSI research and advocacy work",
    learnMore: "/impact",
  },
  {
    id: "community-voices",
    cardTitle: "Community Voices",
    cardDescription: "Stories from the people we work with.",
    eyebrow: "YOUNG PEOPLE. REAL STORIES.",
    title: <>Every young person has a voice worth <em>hearing.</em></>,
    description: "Discover stories, perspectives and updates from students, volunteers and communities working towards a more inclusive future.",
    image: "/images/vsi-community-action.jpg",
    thumb: "/images/vsi-community-action.jpg",
    alt: "Young people participating in community action",
    learnMore: "/news",
  },
  {
    id: "volunteer",
    cardTitle: "Volunteer with VSI",
    cardDescription: "Be part of the change. Make a difference.",
    eyebrow: "YOUR TIME CAN MAKE A DIFFERENCE",
    title: <>Bring your skills. Share your ideas. <em>Take action.</em></>,
    description: "Join a community of young people and supporters contributing their time, energy and skills to youth-led change across Zambia.",
    image: "/images/vsi volunteers 2.jpg",
    thumb: "/images/vsi volunteers 3.jpg",
    alt: "VSI volunteers working together",
    learnMore: "/volunteer",
  },
];

export default function HomeExperience() {
  const [activeId, setActiveId] = useState("who-we-are");
  const active = sections.find((item) => item.id === activeId) || sections[0];

  return (
    <div className="home-experience">
      <section className="hero home-hero" aria-label={active.cardTitle}>
        <div className="hero-image">
          <Image key={active.image} src={active.image} alt={active.alt} fill priority sizes="100vw" />
        </div>
        <div className="hero-overlay" />
        <div className="section-shell hero-content home-hero-content">
          <p className="kicker light">{active.eyebrow}</p>
          <h1>{active.title}</h1>
          <p className="home-hero-description">{active.description}</p>
          <div className="hero-actions home-hero-actions">
            <a className="button button-yellow" href={active.learnMore}>Learn More <span aria-hidden="true">↗</span></a>
            <a className="button button-primary" href="/volunteer">Volunteer with VSI <span aria-hidden="true">↗</span></a>
            <a className="button button-news" href="/news">VSI News <span aria-hidden="true">↗</span></a>
          </div>
        </div>
      </section>

      <nav className="home-section-cards" aria-label="Explore VSI sections">
        {sections.map((section) => (
          <button
            type="button"
            className={`home-section-card ${activeId === section.id ? "is-active" : ""}`}
            key={section.id}
            onClick={() => {
              setActiveId(section.id);
              if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            aria-pressed={activeId === section.id}
            aria-label={`Show ${section.cardTitle} hero`}
          >
            <span className="home-section-card-copy">
              <span className="home-section-card-title">{section.cardTitle}</span>
              <span className="home-section-card-description">{section.cardDescription}</span>
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}
