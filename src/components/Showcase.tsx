import { neonOrange, neonWarmWhite, showcaseItems } from '../data/showcase';
import { productImage } from '../lib/format';
import { goToCategory } from '../lib/hooks';
import { CircularCarousel, type CarouselItem } from './CircularCarousel';
import { NeonLogo } from './NeonLogo';

const items: (CarouselItem & { category: string })[] = showcaseItems.map((s) => ({
  src: productImage(s.image),
  alt: s.alt,
  title: s.title,
  subtitle: s.subtitle,
  category: s.category,
}));

/** Letreiro neon + vitrine giratória com as categorias. */
export function Showcase() {
  return (
    <section className="showcase" id="vitrine" aria-labelledby="vitrine-title">
      <h2 className="sr-only" id="vitrine-title">
        Escolha por categoria
      </h2>
      <div className="wrap showcase__sign">
        <NeonLogo
          text="Empório Burger"
          colors={neonOrange}
          wordColors={[undefined, neonWarmWhite]}
          baseColor="#f17723"
          heat={0.5}
          radius={1.5}
          softness={0.25}
          swell={0.1}
          idle="drift"
          speed={2}
          igniteOnClick
          scale={0.7}
          interactive
          intro
        />
        <p className="showcase__hint">Arraste para girar e toque numa categoria</p>
      </div>

      <div className="showcase__stage">
        <CircularCarousel
          items={items}
          preset="cylinder"
          intro="rise"
          cardWidth={240}
          aspectRatio={1}
          speed={14}
          captions
          gap={28}
          tilt={-5}
          curve={1}
          perspective={2500}
          autoplay="drift"
          interval={3}
          direction="left"
          momentum={0.6}
          snap
          pauseOnHover
          focusOnClick
          draggable
          parallax={0.3}
          stretch={0.5}
          fadeColor="#0f0c0a"
          depthFade={0.55}
          innerShade={0.5}
          cornerRadius={16}
          onSelect={(_, index) => goToCategory(items[index].category)}
        />
      </div>
    </section>
  );
}
