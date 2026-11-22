namespace App
{
    /// <summary>A type whose members a deriving type only inherits.</summary>
    public class Parent
    {
        public void Grow(Parent a) { }
        public void Shrink(Parent a) { }
        public Parent Layout { get; set; }
    }

    /// <summary>
    /// Names, from its own comment, members it only inherits, which the compiler does not find:
    /// <see cref="Shrink(Parent)"/>, <see cref="Layout"/>, <see cref="Grow(Parent)"/>; and its own, <see cref="Grow(Parent[])"/>.
    /// </summary>
    public class Child : Parent
    {
        public void Grow(Parent[] a) { }
    }

    /// <summary>A generic type and a generic method, named below with their type parameters renamed.</summary>
    public class Holder<T>
    {
        public void Put(T item) { }
        public int Echo<M>(M item) => 0;
    }

    /// <summary>
    /// Names members through a type that only inherits them, which the compiler does not find:
    /// <see cref="Child.Shrink(Parent)"/>, <see cref="Child.Shrink"/>, <see cref="Child.Layout"/>, <see cref="Child.Grow(Parent)"/>;
    /// through the type that declares them, which it does: <see cref="Parent.Shrink(Parent)"/>, <see cref="Child.Grow(Parent[])"/>;
    /// and a generic's members with its type parameters renamed, which it binds by position:
    /// <see cref="Holder{X}.Put(X)"/>, <see cref="Holder{X}.Echo{U}(U)"/>, <see cref="Holder{T}.Put(T)"/>.
    /// </summary>
    public class InheritanceNotes { }
}
