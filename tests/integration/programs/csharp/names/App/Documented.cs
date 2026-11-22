namespace App
{
    /// <summary>
    /// Uses nothing in its code; its documentation names other files' declarations, one of each kind:
    /// a type, <see cref="Base"/>; a member, <see cref="Base.Gadget"/>; a nested type, <see cref="Base.Options"/>;
    /// a generic, <see cref="Lib.Helper{T}"/>, beside the type of the same name without one, <see cref="Lib.Helper"/>;
    /// one overload, <see cref="Runner.Run(Runner.Count)"/>, and the other, declared in another file,
    /// <seealso cref="Runner.Run(Runner.Text)"/>; the overloads' name alone, <see cref="Runner.Run"/>;
    /// a namespace, which no other reference here reaches into, <see cref="App.Other"/>; and a name nothing declares,
    /// <see cref="Missing"/>.
    /// </summary>
    /// <permission cref="Derived">A type named on another element.</permission>
    public class Documented
    {
        /// <inheritdoc cref="Base.Gadget"/>
        /// <exception cref="Lib.Thing">A type of a project this one does not reference.</exception>
        public int Gadget { get; set; }
    }
}
