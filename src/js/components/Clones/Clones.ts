import { EVENT_REFRESH, EVENT_RESIZE, EVENT_UPDATED } from '../../constants/events';
import { LOOP } from '../../constants/types';
import { EventInterface } from '../../constructors';
import { Splide } from '../../core/Splide/Splide';
import { BaseComponent, Components, Options } from '../../types';
import { addClass, append, before, ceil, empty, measure, pad, push, rect, remove } from '../../utils';


/**
 * The interface for the Clone component.
 *
 * @since 3.0.0
 */
export interface ClonesComponent extends BaseComponent {
}

/**
 * The component that generates clones for the loop slider.
 *
 * @since 3.0.0
 *
 * @param Splide     - A Splide instance.
 * @param Components - A collection of components.
 * @param options    - Options.
 *
 * @return A Clones component object.
 */
export function Clones( Splide: Splide, Components: Components, options: Options ): ClonesComponent {
  const { on, emit } = EventInterface( Splide );
  const { Elements, Slides } = Components;
  const { resolve } = Components.Direction;

  /**
   * Stores all cloned elements.
   */
  const clones: HTMLElement[] = [];

  /**
   * Keeps the current number of clones.
   */
  let cloneCount: number;

  /**
   * Called when the component is mounted.
   */
  function mount(): void {
    init();
    on( EVENT_REFRESH, destroy );
    on( EVENT_REFRESH, init );
    on( [ EVENT_UPDATED, EVENT_RESIZE ], observe );
  }

  /**
   * Removes all clones if available, and generates new clones.
   */
  function init(): void {
    if ( ( cloneCount = computeCloneCount() ) ) {
      generate( cloneCount );
      emit( EVENT_RESIZE );
    }
  }

  /**
   * Destroys clones.
   */
  function destroy(): void {
    remove( clones );
    empty( clones );
  }

  /**
   * Observes the required clone count and refreshes the slider if necessary.
   */
  function observe(): void {
    if ( cloneCount < computeCloneCount() ) {
      emit( EVENT_REFRESH );
    }
  }

  /**
   * Generates the specified number of clones.
   *
   * @param count - The number of clones to generate for each side.
   */
  function generate( count: number ): void {
    const slides = Slides.get().slice();
    const { length } = slides;

    if ( length ) {
      while ( slides.length < count ) {
        push( slides, slides );
      }

      push( slides.slice( -count ), slides.slice( 0, count ) ).forEach( ( Slide, index ) => {
        const isHead = index < count;
        const clone  = cloneDeep( Slide.slide, index );
        isHead ? before( clone, slides[ 0 ].slide ) : append( Elements.list, clone );
        push( clones, clone );
        Slides.register( clone, index - count + ( isHead ? 0 : length ), Slide.index );
      } );
    }
  }

  /**
   * Deeply clones the provided element with removing the ID attribute.
   *
   * @param elm   - An element to clone.
   * @param index - An index of the clone.
   *
   * @return A cloned element.
   */
  function cloneDeep( elm: HTMLElement, index: number ): HTMLElement {
    const clone = elm.cloneNode( true ) as HTMLElement;
    addClass( clone, options.classes.clone );
    clone.id = `${ Splide.root.id }-clone${ pad( index + 1 ) }`;
    return clone;
  }

  /**
   * Returns the number of elements to generate.
   * This always returns 0 if the slider type is not `'loop'`.
   *
   * @return The number of clones.
   */
  function computeCloneCount(): number {
    let { clones } = options;

    if ( ! Splide.is( LOOP ) ) {
      clones = 0;
    } else if ( ! clones ) {
      const fixedSize  = measure( Elements.list, options[ resolve( 'fixedWidth' ) ] );
      const fixedCount = fixedSize && ceil( rect( Elements.track )[ resolve( 'width' ) ] / fixedSize );
      const baseCount  = fixedCount || ( options[ resolve( 'autoWidth' ) ] && Splide.length ) || options.perPage;

      clones = baseCount * ( options.drag ? ( options.flickMaxPages || 1 ) + 1 : 2 );
    }

    return clones;
  }

  return {
    mount,
    destroy,
  };
}
