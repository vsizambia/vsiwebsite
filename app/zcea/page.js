import "./zcea.css";

export const metadata = {
  title: "Zambia Civic Education Association",
  description: "Promoting and protecting Children's Rights through advocacy and Civic Education for Children's well being.",
};

const work = [
  ["Child Participation", "https://via.placeholder.com/400x250/452E5A/FFFFFF?text=Child+Participation"],
  ["Child Development", "https://via.placeholder.com/400x250/452E5A/FFFFFF?text=Child+Development"],
  ["Child Protection", "https://via.placeholder.com/400x250/452E5A/FFFFFF?text=Child+Protection"],
];

const videos = [
  ["Zone Fam - One Fight (Official Music Video)", "https://via.placeholder.com/400x250/1E104E/FFFFFF?text=Video+Thumbnail+1"],
  ['"I Am NOT Your Father," Said DAD After 27 YEARS', "https://via.placeholder.com/400x250/1E104E/FFFFFF?text=Video+Thumbnail+2"],
  ["Hillsong Worship Best Praise Songs Collection", "https://via.placeholder.com/400x250/1E104E/FFFFFF?text=Video+Thumbnail+3"],
];

export default function ZceaPage() {
  return (
    <div className="zcea-page">
      <header className="zcea-header">
        <h1>ZAMBIA CIVIC EDUCATION ASSOCIATION</h1>
        <p>Promoting and protecting Children&apos;s Rights through advocacy and Civic Education for Children&apos;s well being</p>
      </header>

      <nav className="zcea-nav" aria-label="Primary navigation">
        <ul>
          {[
            "HOME", "WHO WE ARE", "OUR STORY", "PUBLICATIONS",
            "CHILD RIGHTS CLUBS", "NEWS", "TEAM", "CONTACT US",
          ].map((item) => (
            <li key={item}><a href="#">{item}</a></li>
          ))}
        </ul>
      </nav>

      <main>
        <section className="zcea-container">
          <h2 className="zcea-section-title">EXPLORE OUR WORK</h2>
          <div className="zcea-grid">
            {work.map(([title, image]) => (
              <article className="zcea-card" key={title}>
                <img src={image} alt={title} className="zcea-card-img" />
                <div className="zcea-card-body"><h3>{title.toUpperCase()}</h3></div>
              </article>
            ))}
          </div>
        </section>

        <section className="zcea-watch-section">
          <div className="zcea-container">
            <h2 className="zcea-section-title">WATCH OUR WORK</h2>
            <div className="zcea-grid">
              {videos.map(([title, image]) => (
                <article className="zcea-card zcea-video-card" key={title}>
                  <img src={image} alt={title} className="zcea-card-img" />
                  <span className="zcea-play-btn" aria-hidden="true">▶</span>
                  <div className="zcea-card-body"><h3>{title}</h3></div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="zcea-footer">
        <div className="zcea-footer-grid">
          <div className="zcea-footer-col"><h4>ADDRESS</h4><p>Plot No 10822,</p><p>Off Lake Road,</p><p>Woodlands</p></div>
          <div className="zcea-footer-col"><h4>CONTACT</h4><p>Email: info@zcea.org.zm</p><p>Phone: +260 211 000000</p><p>Fax: +260 211 000001</p></div>
          <div className="zcea-footer-col"><h4>FOLLOW US</h4><ul><li><a href="#">Facebook</a></li><li><a href="#">LinkedIn</a></li><li><a href="#">Instagram</a></li></ul></div>
        </div>
        <div className="zcea-copyright">&copy; 2026 Zambia Civic Education Association. All rights reserved.</div>
      </footer>
    </div>
  );
}
