import Image from 'next/image'
import Link from 'next/link'
import './styles.css'

export default function SourcingImage() {
  return (
    <article className="si-article">
      <Link href="/design-experiments" className="si-back">
        Back
      </Link>

      {/* Hero: Full-bleed image with title overlay */}
      <header className="si-hero">
        <Image
          src="/images/sourcing-image/aerial-forest-turquoise-water.jpg"
          alt="Aerial view of forest meeting turquoise water"
          fill
          className="si-hero-img"
          priority
        />
        <div className="si-hero-overlay">
          <p className="si-hero-issue">Issue 04 / February 2026</p>
          <h1 className="si-hero-title">The Geometry of Attention</h1>
          <p className="si-hero-subtitle">
            How visual composition directs the eye, holds the mind,
            and shapes what we remember
          </p>
        </div>
      </header>

      {/* Intro section with drop cap */}
      <section className="si-intro">
        <div className="si-intro-meta">
          <span>Words by Elaine Tsao</span>
          <span className="si-meta-sep" />
          <span>12 min read</span>
        </div>
        <p className="si-dropcap">
          We rarely think about why our eyes move the way they do. A glance
          across a room, a scan down a printed page, the instinctive fixation
          on a face in a crowd&mdash;these movements feel automatic, almost
          involuntary. But every visual environment is a carefully laid trap
          for attention, whether its designer intended it or not.
        </p>
        <p>
          The geometry of attention is older than graphic design, older than
          photography, older than the written word itself. It lives in the
          diagonal slash of a river through a valley, in the radial symmetry
          of a sunflower, in the way a mother&apos;s face fills an infant&apos;s
          entire field of vision. We are pattern-seeking creatures navigating
          a world that is, at every scale, composed of patterns.
        </p>
      </section>

      {/* Side-by-side image pair */}
      <section className="si-pair">
        <figure className="si-pair-left">
          <Image
            src="/images/sourcing-image/curved-honeycomb-building-facade.jpg"
            alt="Curved honeycomb building facade"
            width={640}
            height={480}
            className="si-pair-img"
          />
          <figcaption>Fig. 01</figcaption>
        </figure>
        <figure className="si-pair-right">
          <Image
            src="/images/sourcing-image/stacked-vintage-keyboards-closeup.jpeg"
            alt="Stacked vintage keyboard keys"
            width={640}
            height={480}
            className="si-pair-img"
          />
          <figcaption>Fig. 02</figcaption>
        </figure>
      </section>

      {/* Text with inset image */}
      <section className="si-body-section">
        <h2 className="si-section-heading">The Grid and the Gaze</h2>
        <div className="si-inset-block">
          <figure className="si-inset-figure">
            <Image
              src="/images/sourcing-image/man-profile-colored-lighting.jpeg"
              alt="Man in colored lighting"
              width={320}
              height={420}
              className="si-inset-img"
            />
            <figcaption>Fig. 03&mdash;Profile study</figcaption>
          </figure>
          <div className="si-inset-text">
            <p>
              In 1928, Jan Tschichold published <em>Die neue Typographie</em>,
              a manifesto that would reshape how information meets the eye.
              His argument was deceptively simple: the arrangement of elements
              on a surface is not decoration but communication. Every margin,
              every column break, every unit of white space carries meaning.
            </p>
            <p>
              What Tschichold understood&mdash;and what contemporary designers
              often forget&mdash;is that a grid is not a cage. It is a gravitational
              field. Elements placed on a grid acquire relationships:
              proximity implies connection, alignment implies order, deviation
              implies emphasis. The grid does not constrain the eye. It gives
              the eye a path.
            </p>
            <p>
              This is the paradox at the heart of visual composition. Freedom
              without structure produces chaos. Structure without freedom
              produces monotony. The most compelling visual experiences live
              in the tension between the two&mdash;a rigorous underlying system
              with strategic, deliberate breaks.
            </p>
          </div>
        </div>
      </section>

      {/* Large feature image with caption overlay */}
      <section className="si-feature">
        <figure className="si-feature-figure">
          <Image
            src="/images/sourcing-image/vintage-3d-glasses-audience.jpg"
            alt="1950s audience wearing 3D glasses"
            width={1200}
            height={680}
            className="si-feature-img"
          />
          <figcaption className="si-feature-caption">
            <span className="si-caption-num">Fig. 04</span>
            <span className="si-caption-text">
              Collective attention, Hollywood, circa 1952. Every face oriented
              toward the same vanishing point.
            </span>
          </figcaption>
        </figure>
      </section>

      {/* Pull quote */}
      <section className="si-pullquote-section">
        <blockquote className="si-pullquote">
          <p>
            &ldquo;The eye does not see things but the relationships
            between things.&rdquo;
          </p>
          <cite>&mdash;Henri Matisse, 1947</cite>
        </blockquote>
      </section>

      {/* Body section with right-aligned image */}
      <section className="si-body-section">
        <h2 className="si-section-heading">Peripheral Signals</h2>
        <div className="si-right-block">
          <div className="si-right-text">
            <p>
              Peripheral vision is not a lesser form of seeing. It is a
              surveillance system, an early-warning network tuned to detect
              movement, contrast, and anomaly. When a shape appears at the
              edge of your visual field, it triggers a cascade of neural
              events that can redirect your gaze in under 200 milliseconds.
            </p>
            <p>
              Designers who understand peripheral processing create
              compositions that work at multiple distances. A magazine spread
              that reads clearly from arm&apos;s length must also beckon from
              across the room. A poster must arrest a passerby in motion.
              The geometry shifts at every scale, but the underlying
              architecture&mdash;the bones of the composition&mdash;remains legible.
            </p>
            <p>
              Consider how a single diagonal line across an otherwise static
              composition creates the sensation of movement. The eye follows
              the diagonal involuntarily, tracing its path, seeking its
              origin and destination. This is not learned behavior. It is
              wired into the visual cortex, a remnant of evolutionary
              pressures that made detecting the trajectory of a thrown spear
              a matter of survival.
            </p>
          </div>
          <figure className="si-right-figure">
            <Image
              src="/images/sourcing-image/asian-woman-yellow-wall.jpg"
              alt="Portrait against yellow wall"
              width={380}
              height={500}
              className="si-right-img"
            />
            <figcaption>Fig. 05</figcaption>
          </figure>
        </div>
      </section>

      {/* Asymmetric 3-image grid */}
      <section className="si-trio">
        <figure className="si-trio-large">
          <Image
            src="/images/sourcing-image/flying-car-cyberpunk-city.jpeg"
            alt="Flying car in cyberpunk cityscape"
            width={760}
            height={500}
            className="si-trio-img"
          />
          <figcaption>Fig. 06</figcaption>
        </figure>
        <figure className="si-trio-small-top">
          <Image
            src="/images/sourcing-image/kid-goldfish-bag-surreal.jpeg"
            alt="Child with goldfish bag"
            width={400}
            height={240}
            className="si-trio-img"
          />
          <figcaption>Fig. 07</figcaption>
        </figure>
        <figure className="si-trio-small-bottom">
          <Image
            src="/images/sourcing-image/japanese-calligraphy-portrait-art.jpeg"
            alt="Japanese calligraphy portrait"
            width={400}
            height={240}
            className="si-trio-img"
          />
          <figcaption>Fig. 08</figcaption>
        </figure>
      </section>

      {/* Final text section */}
      <section className="si-body-section">
        <h2 className="si-section-heading">The Afterimage</h2>
        <p>
          What stays with us after we close the magazine, leave the gallery,
          scroll past the image? Not the content, usually. Not the specific
          arrangement of pixels or ink. What lingers is a spatial memory&mdash;
          the feeling of a composition, its weight and rhythm, the way it
          held us for a moment before releasing us back into the stream.
        </p>
        <p>
          This is the final geometry: the shape a visual experience leaves
          in the mind. It is imprecise, impressionistic, deeply personal.
          Two people looking at the same photograph will carry away different
          afterimages, shaped by their own histories of seeing. But the
          designer&apos;s hand is still there, guiding even this ghost&mdash;the
          emphasis that became a memory, the contrast that became an emotion,
          the rhythm that became a feeling of wholeness or unease.
        </p>
      </section>

      {/* Full-width closing image */}
      <section className="si-full-bleed">
        <figure className="si-full-figure">
          <Image
            src="/images/sourcing-image/desert-mountains-starry-night.jpg"
            alt="Starry night over desert mountains"
            width={1400}
            height={600}
            className="si-full-img"
          />
          <figcaption className="si-full-caption">
            Fig. 09&mdash;Where every line of sight converges: the horizon
          </figcaption>
        </figure>
      </section>

      {/* Closing Thoughts */}
      <section className="si-closing">
        <div className="si-closing-rule" />
        <h2 className="si-closing-heading">Closing Thoughts</h2>
        <p>
          Every image in this essay was chosen before a single word was written.
          That inversion&mdash;visual first, language second&mdash;mirrors how
          attention itself operates. We see before we name. We feel the weight
          of a composition before we can articulate why it holds us.
        </p>
        <p>
          The sourcing of images is its own form of writing. Each photograph
          carries a tonal register, a rhythm, a set of spatial relationships
          that either harmonize with or disrupt the images around it. Curating
          a sequence is like tuning an instrument: the individual notes matter
          less than the intervals between them.
        </p>
        <p>
          If this experiment proves anything, it is that editorial design is
          not illustration. The images do not serve the text. The text does not
          explain the images. They exist in dialogue&mdash;two voices, neither
          subordinate, each making the other more precise.
        </p>
      </section>

      {/* Colophon */}
      <footer className="si-colophon">
        <div className="si-colophon-rule" />
        <div className="si-colophon-content">
          <p className="si-colophon-pub">
            The Geometry of Attention was originally published in
            Compound Eye, Issue 04, February 2026.
          </p>
          <p className="si-colophon-credits">
            Art direction by Studio Null. Photography sourced from
            independent archives. Set in Cormorant Garamond and DM Sans.
          </p>
        </div>
      </footer>
    </article>
  )
}
