<template>
  <section class="content-page container narrow legal-copy">
    <p class="eyebrow">Privacy</p>
    <h1>A small service with a small data footprint.</h1>
    <p>Last updated: 2 September 2026</p>

    <h2>Controller</h2>
    <address>
      Arnold Arz von Straussenburg<br />
      c/o Universität Koblenz<br />
      Universitätsstraße 1<br />
      56070 Koblenz<br />
      Germany
    </address>

    <h2>What is processed</h2>
    <p>
      Loading the site necessarily sends connection information such as your IP
      address, requested URL, time, browser identifier, and protocol metadata to
      the systems serving it. This processing is required to deliver the site and
      keep it secure and available. The legal basis is the operator's legitimate
      interest in providing a reliable website under Article 6(1)(f) GDPR. You
      cannot use the website without transmitting this technically necessary
      information.
    </p>
    <p>
      When you ask CentMatch to solve a balance, the amount and selected prices
      are sent to the Go API. Custom item labels are included if you supplied
      them, so do not put personal or confidential information in a price-list
      label. The API holds a request only in memory while solving it and does not
      write it to a database or application log.
    </p>

    <h2>Storage, cookies, and tracking</h2>
    <p>
      CentMatch does not create accounts, set cookies, use browser storage, run
      analytics, serve advertisements, or embed third-party fonts and media. Its
      own Nginx access log is disabled. Hosting and network infrastructure may
      still process limited connection data as processors to operate and secure
      the service. CentMatch does not intentionally retain that data in the
      application; infrastructure security logs are deleted when they are no
      longer needed for those purposes.
    </p>

    <h2>External links</h2>
    <p>
      Links to Apple, Galva, Wikimedia Commons, NIST, MIT OpenCourseWare, and
      GitHub are ordinary links. Those services receive information only if you
      choose to follow a link, and their own privacy terms then apply.
    </p>

    <h2>Automated decisions and transfers</h2>
    <p>
      The numerical result is generated automatically, but it has no legal or
      similarly significant effect. CentMatch does not intentionally transfer
      submitted solver data outside the European Economic Area.
    </p>

    <h2>Your rights</h2>
    <p>
      Subject to the GDPR's requirements, you may request access, correction,
      deletion, restriction, portability, or object to processing. You may also
      complain to a competent data-protection authority, such as the
      <a href="https://www.datenschutz.rlp.de/" target="_blank" rel="noreferrer">
        State Commissioner for Data Protection and Freedom of Information Rhineland-Palatinate
      </a>.
      Use the contact address above for a request or question. The
      <a href="https://eur-lex.europa.eu/eli/reg/2016/679/oj" target="_blank" rel="noreferrer">
        official GDPR text
      </a>
      contains the full conditions and limits of those rights.
    </p>
  </section>
</template>

<script setup lang="ts">
useHead({ title: "Privacy — CentMatch" });
</script>
