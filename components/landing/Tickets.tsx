export default function Tickets() {
  return (
    <section className="tickets" id="tickets">
      <div className="tickets-stage" id="ticketsStage">
        {/* Cards are the original's baked artwork (photo, name, quote, perforation all
            in the webp) — DOM order matches orig: t0,t2,t1,t3,t5,t4 */}
        <article className="pass" data-i="0"><img className="pass-art" src="/assets/img/ticket-d0.webp" alt="quote from Kunal Saini" /></article>
        <article className="pass" data-i="1"><img className="pass-art" src="/assets/img/ticket-d2.webp" alt="quote from Prabhdeep Chawla" /></article>
        <article className="pass" data-i="2"><img className="pass-art" src="/assets/img/ticket-d1.webp" alt="quote from Mike Madden" /></article>
        <article className="pass" data-i="3"><img className="pass-art" src="/assets/img/ticket-d3.webp" alt="quote from Chris Gadek" /></article>
        <article className="pass" data-i="4"><img className="pass-art" src="/assets/img/ticket-d5.webp" alt="quote from Tamasin Ford" /></article>
        <article className="pass" data-i="5"><img className="pass-art" src="/assets/img/ticket-d4.webp" alt="quote from Tom Impallomeni" /></article>
      </div>
    </section>
  );
}
