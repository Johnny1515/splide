import { DESTROYED } from '../../../constants/states';
import { init } from '../../../test';


describe( 'Options', () => {
  beforeAll( () => {
    window.matchMedia = () => ( {
      matches            : true, // All queries match the media string.
      media              : '',
      onchange           : null,
      addListener        : jest.fn(),
      removeListener     : jest.fn(),
      addEventListener   : jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent      : jest.fn(),
    } as MediaQueryList );
  } );

  test( 'can merge options when a breakpoint matches the media query.', () => {
    const splide = init( { perPage: 2, breakpoints: { 640: { perPage: 4 } } } );
    expect( splide.options.perPage ).toBe( 4 );
  } );

  test( 'can destroy Splide.', () => {
    const splide = init( { breakpoints: { 640: { destroy: true } } } );
    expect( splide.state.is( DESTROYED ) ).toBe( true );
  } );

  test( 'can merge options for prefers-reduced-motion:reduce.', () => {
    const splide = init();
    expect( splide.options.speed ).toBe( 0 );
    expect( splide.options.autoplay ).toBe( 'pause' );
  } );
} );
