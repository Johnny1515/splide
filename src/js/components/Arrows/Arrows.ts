import { ALL_ATTRIBUTES, ARIA_CONTROLS, ARIA_LABEL } from '../../constants/attributes';
import {
  EVENT_ARROWS_MOUNTED,
  EVENT_ARROWS_UPDATED,
  EVENT_MOUNTED,
  EVENT_MOVED,
  EVENT_REFRESH,
  EVENT_SCROLLED,
  EVENT_UPDATED,
} from '../../constants/events';
import { EventInterface } from '../../constructors';
import { Splide } from '../../core/Splide/Splide';
import { BaseComponent, Components, Options } from '../../types';
import {
  append,
  apply,
  before,
  child,
  create,
  display,
  parseHtml,
  remove,
  removeAttribute,
  setAttribute,
} from '../../utils';
import { PATH, SIZE, XML_NAME_SPACE } from './path';


/**
 * The interface for the Arrows component.
 *
 * @since 3.0.0
 */
export interface ArrowsComponent extends BaseComponent {
  arrows: { prev?: HTMLButtonElement, next?: HTMLButtonElement };
}

/**
 * The component for handling previous and next arrows.
 *
 * @since 3.0.0
 *
 * @param Splide     - A Splide instance.
 * @param Components - A collection of components.
 * @param options    - Options.
 *
 * @return An Arrows component object.
 */
export function Arrows( Splide: Splide, Components: Components, options: Options ): ArrowsComponent {
  const { on, bind, emit } = EventInterface( Splide );
  const { classes, i18n } = options;
  const { Elements, Controller } = Components;

  /**
   * The wrapper element.
   */
  let wrapper = Elements.arrows;

  /**
   * The previous arrow element.
   */
  let prev = Elements.prev;

  /**
   * The next arrow element.
   */
  let next = Elements.next;

  /**
   * Indicates whether the component creates arrows or retrieved from the DOM.
   */
  let created: boolean;

  /**
   * An object with previous and next arrows.
   */
  const arrows: ArrowsComponent[ 'arrows' ] = {};

  /**
   * Called when the component is mounted.
   */
  function mount(): void {
    init();
    on( EVENT_UPDATED, init );
  }

  /**
   * Initializes the component.
   */
  function init(): void {
    if ( options.arrows ) {
      if ( ! prev || ! next ) {
        createArrows();
      }
    }

    if ( prev && next ) {
      if ( ! arrows.prev ) {
        setAttribute( [ prev, next ], ARIA_CONTROLS, Elements.list.id );

        arrows.prev = prev;
        arrows.next = next;

        listen();

        emit( EVENT_ARROWS_MOUNTED, prev, next );
      }

      display( wrapper, options.arrows === false ? 'none' : '' );
    }
  }

  /**
   * Destroys the component.
   */
  function destroy(): void {
    if ( created ) {
      remove( wrapper );
    } else {
      removeAttribute( [ prev, next ], ALL_ATTRIBUTES );
    }
  }

  /**
   * Listens to some events.
   */
  function listen(): void {
    const { go } = Controller;
    on( [ EVENT_MOUNTED, EVENT_MOVED, EVENT_UPDATED, EVENT_REFRESH, EVENT_SCROLLED ], update );
    bind( next, 'click', apply( go, '>', true, undefined ) );
    bind( prev, 'click', apply( go, '<', true, undefined ) );
  }

  /**
   * Create arrows and append them to the slider.
   */
  function createArrows(): void {
    wrapper = create( 'div', classes.arrows );
    prev    = createArrow( true );
    next    = createArrow( false );
    created = true;

    append( wrapper, [ prev, next ] );
    before( wrapper, child( options.arrows === 'slider' && Elements.slider || Splide.root ) );
  }

  /**
   * Creates an arrow button.
   *
   * @param prev - Determines whether to create a previous or next arrow.
   *
   * @return A created button element.
   */
  function createArrow( prev: boolean ): HTMLButtonElement {
    const arrow = `<button class="${ classes.arrow } ${ prev ? classes.prev : classes.next }" type="button">`
      +	`<svg xmlns="${ XML_NAME_SPACE }" viewBox="0 0 ${ SIZE } ${ SIZE }" width="${ SIZE }" height="${ SIZE }">`
      + `<path d="${ options.arrowPath || PATH }" />`;

    return parseHtml<HTMLButtonElement>( arrow );
  }

  /**
   * Updates status of arrows, such as `disabled` and `aria-label`.
   */
  function update(): void {
    const index     = Splide.index;
    const prevIndex = Controller.getPrev();
    const nextIndex = Controller.getNext();
    const prevLabel = prevIndex > -1 && index < prevIndex ? i18n.last : i18n.prev;
    const nextLabel = nextIndex > -1 && index > nextIndex ? i18n.first : i18n.next;

    prev.disabled = prevIndex < 0;
    next.disabled = nextIndex < 0;

    setAttribute( prev, ARIA_LABEL, prevLabel );
    setAttribute( next, ARIA_LABEL, nextLabel );

    emit( EVENT_ARROWS_UPDATED, prev, next, prevIndex, nextIndex );
  }

  return {
    arrows,
    mount,
    destroy,
  };
}
