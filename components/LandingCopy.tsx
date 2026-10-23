function Verse({ lines }: { lines: string[] }) {
  return (
    <p>
      {lines.map((line, index) => (
        <span key={line} className={index === 0 ? "block" : "block pl-6 sm:pl-8"}>
          {line}
        </span>
      ))}
    </p>
  );
}

export function Invitation() {
  return (
    <div className="max-w-2xl">
      <p className="font-serif text-[1.7rem] leading-snug text-balance text-foreground sm:text-3xl">
        Let’s join together to be the Jacob Generation that seeks the face of God for our
        community and state!
      </p>
      <div className="mt-6 space-y-4 text-lg leading-8">
        <p>
          Election Day is November 3rd. Wouldn’t it be amazing to know we have 24 hours of
          united intercession covering our Valley and contending for Washington State to be a
          state of righteousness?!
        </p>
        <p>
          So, from <strong className="font-semibold">today</strong> until{" "}
          <strong className="font-semibold">Nov. 3rd</strong>, let us each commit to 1 hour a
          day for the next 13 days to create a continual incense of prayer before the Lord.
        </p>
        <p>Let us contend for a spiritual awakening in this Valley and in Washington State!</p>
      </div>
      <p className="mt-8 leading-7 text-muted">
        Please review the available slots below and click on the button to sign up. Thank you!
      </p>
      <p className="mt-2 text-sm text-muted">Hours are Pacific Time.</p>
    </div>
  );
}

export function Scripture() {
  return (
    <section className="mt-16 max-w-2xl space-y-6 border-t border-line pt-12">
      <article className="rounded-3xl border border-line bg-paper px-6 py-8 sm:px-8">
        <h2 className="text-sm font-medium tracking-[0.16em] text-pine uppercase">
          Psalm 24:1–6
        </h2>
        <div className="mt-5 space-y-5 font-serif text-xl leading-8">
          <Verse
            lines={[
              "The earth is the Lord’s, and everything in it,",
              "the world, and all who live in it;",
            ]}
          />
          <Verse
            lines={["for he founded it on the seas", "and established it on the waters."]}
          />
          <Verse
            lines={[
              "Who may ascend the mountain of the Lord?",
              "Who may stand in his holy place?",
            ]}
          />
          <Verse
            lines={[
              "The one who has clean hands and a pure heart,",
              "who does not trust in an idol",
              "or swear by a false god.",
            ]}
          />
          <Verse
            lines={[
              "They will receive blessing from the Lord",
              "and vindication from God their Savior.",
            ]}
          />
          <Verse
            lines={[
              "Such is the generation of those who seek him,",
              "who seek your face, God of Jacob.",
            ]}
          />
        </div>
      </article>

      <article className="rounded-3xl border border-line bg-paper px-6 py-8 sm:px-8">
        <h2 className="text-sm font-medium tracking-[0.16em] text-pine uppercase">
          Genesis 32:24–30
        </h2>
        <div className="mt-5 space-y-4 font-serif text-xl leading-8">
          <p>
            So Jacob was left alone, and a man wrestled with him till daybreak. When the man
            saw that he could not overpower him, he touched the socket of Jacob’s hip so that
            his hip was wrenched as he wrestled with the man. Then the man said, “Let me go,
            for it is daybreak.”
          </p>
          <p>But Jacob replied, “I will not let you go unless you bless me.”</p>
          <p>The man asked him, “What is your name?”</p>
          <p>“Jacob,” he answered.</p>
          <p>
            Then the man said, “Your name will no longer be Jacob, but Israel, because you
            have struggled with God and with man and have overcome.”
          </p>
        </div>
      </article>
    </section>
  );
}
