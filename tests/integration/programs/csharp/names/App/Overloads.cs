using M = App;

namespace App
{
    /// <summary>Overloads told apart only by what their parameters' types are written with.</summary>
    public class Mixer
    {
        public Mixer() { }
        public Mixer(Mixer other) { }
        public int Mix(Mixer[] a) => 0;
        public int Mix(ref Mixer a) => 0;
        public int Mix(Mixer a, Mixer b) => 0;
        public int Grid(Mixer[,] a) => 0;
        public int Grid(Mixer[] a) => 0;
        public int Take(Box<Mixer> a) => 0;
        public int Take(Box<Box<Mixer>> a) => 0;
        public int Opt(Mixer a) => 0;
        public int Opt(Mixer a, params Mixer[] rest) => 0;
        public int Out(out Mixer a) { a = null; return 0; }
        public int Out(Mixer a) => 0;
    }

    /// <summary>A generic type for <see cref="Mixer"/>'s overloads to take.</summary>
    public class Box<T> { }

    /// <summary>
    /// Names one overload each, within its own file, as the compiler resolves it:
    /// <see cref="Mixer.Mix(Mixer[])"/>, <see cref="Mixer.Mix(ref Mixer)"/>, <see cref="Mixer.Mix(Mixer, Mixer)"/>,
    /// <see cref="Mixer.Grid(Mixer[,])"/>, <see cref="Mixer.Grid(Mixer[])"/>,
    /// <see cref="Mixer.Take(Box{Mixer})"/>, <see cref="Mixer.Take(Box{Box{Mixer}})"/>,
    /// <see cref="Mixer.Opt(Mixer, Mixer[])"/>, <see cref="Mixer.Out(out Mixer)"/>, <see cref="Mixer.Out(Mixer)"/>,
    /// <see cref="Mixer.Mixer(Mixer)"/>; and names none where no overload has the parameters written:
    /// <see cref="Mixer.Mix(Box{Mixer})"/>, <see cref="Mixer.Mix(Mixer,)"/>, <see cref="Mixer.Out(ref Mixer)"/>,
    /// <see cref="Mixer.Mixer(Box{Mixer})"/>; and an alias-qualified name the compiler's grammar does not take, <see cref="M::Mixer"/>.
    /// </summary>
    public class MixerNotes { }

    /// <summary>Uses another file's type only as the type of a <c>params</c> parameter.</summary>
    public class Gatherer
    {
        public int Gather(params Derived[] parts) => 0;
    }
}
