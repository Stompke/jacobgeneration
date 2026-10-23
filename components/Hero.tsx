import Image from "next/image";

export function Hero() {
  return (
    <section className="relative isolate min-h-[70vh] overflow-hidden text-white">
      <Image
        src="/hero.jpg"
        alt="Dawn mist over a still mountain lake"
        fill
        priority
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/25" />
      <div className="relative mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-end px-6 pb-16 pt-28">
        <p className="text-sm font-medium tracking-[0.2em] text-white/80 uppercase">
          Jacob Generation
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.05] text-balance sm:text-7xl">
          Washington Prayer Sign up
        </h1>
      </div>
    </section>
  );
}
