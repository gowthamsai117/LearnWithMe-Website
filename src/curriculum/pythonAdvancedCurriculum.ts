import type { Topic } from './curriculumData';

export const phase6Topics: Topic[] = [
  {
    id: 'p6-t1',
    name: 'Modules & Packages',
    buildFirst: true,
    starterCode: `# Simulate importing modules and namespaces
import math
from datetime import date

print("Pi constant:    ", math.pi)
print("Today's date:   ", date.today())
print("Directory list: ", dir(math)[:5])  # dir lists module names
`,
    explanation: `### Modules & Packages
Modules and Packages help organize Python applications into clean namespaces.

#### Definitions:
1. **Module**: Any \`.py\` file containing Python code, functions, or classes.
2. **Package**: A folder containing multiple modules and an initialization file named **\`__init__.py\`**.
3. **\`sys.path\`**: The list of directory paths that Python searches for modules upon importing.`
  }
];

export const phase7Topics: Topic[] = [
  {
    id: 'p7-t1',
    name: 'File Input/Output',
    buildFirst: true,
    starterCode: `# Write and read text using virtual string buffers
# (Safe sandbox version without actual filesystem writes)
content = "PyPath - Master Python step-by-step!"

# Write Simulation
print("Writing content to file: ", content)

# Read Simulation
print("Reading file output:     ", content.upper())
`,
    explanation: `### File Input/Output (I/O)
File handling enables applications to read and write persistent data.

#### Key Syntax:
- **\`open(filename, mode)\`**: Opens files. Modes: \`r\` (read), \`w\` (write), \`a\` (append).
- **Context Managers (\`with\` statement)**: Recommended to auto-close file streams:
\`\`\`python
with open("test.txt", "w") as f:
    f.write("Hello World")
\`\`\`
- Safe closure guarantees resources are released even if exceptions occur.`
  }
];

export const phase8Topics: Topic[] = [
  {
    id: 'p8-t1',
    name: 'Exception Handling',
    buildFirst: true,
    starterCode: `# Handle errors gracefully to prevent crashes
try:
    num = 10
    denom = 0
    val = num / denom
except ZeroDivisionError as err:
    print(f"Error caught: {err}")
finally:
    print("Cleanup: This block executes no matter what.")
`,
    explanation: `### Exception Handling (\`try-except-finally\`)
Exceptions handle runtime errors gracefully, preserving program execution.

#### Blocks:
- **\`try\`**: Contains code that might trigger an exception.
- **\`except ExceptionName as err\`**: Catches and processes matching errors.
- **\`else\`**: Executes code *only* if the try block completed without exceptions.
- **\`finally\`**: Runs cleanup instructions unconditionally, whether errors occurred or not.`
  }
];

export const phase9Topics: Topic[] = [
  {
    id: 'p9-t1',
    name: 'Classes/Objects',
    buildFirst: true,
    visualizerId: 'oop-basics',
    starterCode: `# Instantiate and execute object methods!
class Car:
    def __init__(self, color, brand):
        self.color = color
        self.brand = brand
        self.speed = 0

    def accelerate(self, amount):
        self.speed += amount
        print(f"{self.brand} is driving at {self.speed} km/h")

my_car = Car("Red", "Tesla")
my_car.accelerate(50)
`,
    explanation: `### Object-Oriented Programming (OOP) in Python
OOP centers around organizing code into templates called **Classes**, which create instances called **Objects**.

#### Terminology:
1. **Class**: A blueprint defining attributes (data) and methods (behavior).
2. **Object (Instance)**: A concrete memory representation of a class.
3. **\`__init__\` Method**: The constructor initializing instance variables when a new object is instantiated.
4. **\`self\` Parameter**: Points directly to the current object instance being manipulated.

The visualizer renders a factory canvas. Instantiate custom car classes and execute behaviors to see instance properties update.`
  },
  {
    id: 'p9-t2',
    name: 'Inheritance',
    buildFirst: true,
    starterCode: `class Animal:
    def __init__(self, name):
        self.name = name
    def speak(self):
        return "Generic sound"

class Dog(Animal):  # Inherits from Animal
    def speak(self):
        return "Woof!"

dog = Dog("Rex")
print(f"Dog: {dog.name} | Sound: {dog.speak()}")
`,
    explanation: `### OOP: Inheritance
Inheritance allows a subclass to inherit attributes and methods from a parent class.

#### Key Mechanics:
- **Code Reuse**: Subclasses inherit fields and behaviors, avoiding duplication.
- **Overriding**: Subclasses can override parent methods to provide specific behaviors.
- **\`super()\`**: Calls methods on parent classes inside subclass definitions.`
  },
  {
    id: 'p9-t3',
    name: 'Polymorphism',
    buildFirst: true,
    starterCode: `class Cat:
    def speak(self): return "Meow"
class Duck:
    def speak(self): return "Quack"

def make_speak(animal):
    print(animal.speak())

make_speak(Cat())
make_speak(Duck())
`,
    explanation: `### OOP: Polymorphism
Polymorphism allows different classes to share interface methods.

#### Key Concepts:
- **Method Overriding**: Multiple subclasses implement matching method signatures in unique ways.
- **Duck Typing**: "If it walks like a duck and quacks like a duck, it is a duck." Python evaluates methods based on whether they exist at runtime, not strict type hierarchies.`
  },
  {
    id: 'p9-t4',
    name: 'Encapsulation',
    buildFirst: true,
    starterCode: `class Account:
    def __init__(self, balance):
        self.__balance = balance  # Private variable
        
    def get_balance(self):
        return self.__balance
        
    def deposit(self, amount):
        if amount > 0:
            self.__balance += amount

acc = Account(100)
acc.deposit(50)
print("Balance: ", acc.get_balance())
`,
    explanation: `### OOP: Encapsulation
Encapsulation bundles data properties and validation methods together inside classes.

#### Visibility Levels:
- **Public**: Default access.
- **Protected (\`_var\` syntax)**: Indicator warning subclasses that variables are internal.
- **Private (\`__var\` syntax)**: Triggers **Name Mangling** under the hood, making direct outer calls harder to execute.`
  },
  {
    id: 'p9-t5',
    name: 'Abstraction',
    buildFirst: true,
    starterCode: `from abc import ABC, abstractmethod

class Vehicle(ABC):
    @abstractmethod
    def start_engine(self):
        pass

class Bike(Vehicle):
    def start_engine(self):
        print("Bike engine started. Ready to ride!")

b = Bike()
b.start_engine()
`,
    explanation: `### OOP: Abstraction
Abstraction hides implementation details, exposing interfaces.

#### Key Mechanics:
- **Abstract Base Class (ABC)**: Inherited from \`abc.ABC\`. Cannot be instantiated directly.
- **\`@abstractmethod\`**: Forces subclasses to override and define matching methods, establishing structural API guidelines.`
  },
  {
    id: 'p9-t6',
    name: 'Magic Methods',
    buildFirst: true,
    starterCode: `class Book:
    def __init__(self, title, pages):
        self.title = title
        self.pages = pages
        
    def __str__(self):
        return f"'{self.title}' ({self.pages} pgs)"
        
    def __len__(self):
        return self.pages

book = Book("Python 101", 320)
print(str(book))
print("Length: ", len(book))
`,
    explanation: `### OOP: Magic Methods (Dunder Methods)
Magic methods are predefined hook overrides prefixed and suffixed by double underscores (\`__\`).

#### Common Overrides:
- **\`__str__\`**: Formats strings for end-users (\`print(obj)\`).
- **\`__repr__\`**: Formats unambiguous strings for debugging developers.
- **\`__len__\`**: Custom length output (\`len(obj)\`).
- **\`__add__\`**: Overloads addition arithmetic operators (\`obj1 + obj2\`).`
  },
  {
    id: 'p9-t7',
    name: 'MRO & super()',
    buildFirst: true,
    starterCode: `class A:
    def show(self): print("A")
class B(A):
    def show(self): print("B")
class C(A):
    def show(self): print("C")
class D(B, C):
    pass

d = D()
d.show()  # MRO resolves class search
print("MRO: ", [cls.__name__ for cls in D.__mro__])
`,
    explanation: `### Method Resolution Order (MRO)
MRO defines the search sequence Python uses to resolve inherits inside multiple inheritance hierarchies.

#### Mechanics:
- **C3 Linearization**: Python's mathematical ordering algorithm ensuring parent classes are resolved after children.
- **\`__mro__\` Attribute**: Inspects resolve hierarchies.
- **\`super()\`**: Invokes methods on parent classes matching order paths.`
  },
  {
    id: 'p9-t8',
    name: 'SOLID Principles',
    buildFirst: true,
    starterCode: `# Design patterns matching SOLID guidelines
# S: Single Responsibility
# O: Open-Closed (classes open to extension, closed to modification)
class DiscountCalculator:
    def calculate(self, price):
        return price
`,
    explanation: `### SOLID Principles
Five core architectural guidelines for clean OOP design:

1. **S**ingle Responsibility: A class should have one reason to change.
2. **O**pen/Closed: Open to extension, closed to modification.
3. **L**iskov Substitution: Subclasses must be substitutable for parent classes.
4. **I**nterface Segregation: Prefer specific interfaces over general ones.
5. **D**ependency Inversion: Depend on abstractions, not concrete implementations.`
  }
];

export const phase10Topics: Topic[] = [
  {
    id: 'p10-t1',
    name: 'Advanced Python Features',
    buildFirst: true,
    starterCode: `from dataclasses import dataclass
from enum import Enum

class Role(Enum):
    ADMIN = 1
    USER = 2

@dataclass
class UserInfo:
    username: string
    role: Role

user = UserInfo("antigravity", Role.ADMIN)
print("Dataclass Object: ", user)
`,
    explanation: `### Advanced Python Features
Advanced standard library components simplifying architectures:

#### Tools:
- **Dataclasses**: Auto-generates initializers, comparison overrides, and strings.
- **Enums**: Group constants inside namespaces.
- **Context Managers**: Write custom \`__enter__\` and \`__exit__\` overrides for resource allocations.`
  }
];

export const phase11Topics: Topic[] = [
  {
    id: 'p11-t1',
    name: 'Python Internals & GIL',
    buildFirst: true,
    starterCode: `# Inspect reference counts
import sys

x = [1, 2, 3]
print("Ref count of x: ", sys.getrefcount(x) - 1)  # Subtract temporary function call reference
`,
    explanation: `### CPython Internals & GIL
CPython is Python's default C-based engine.

#### Components:
- **Bytecode compilation**: Python files compile to byte codes (\`.pyc\`), then process inside virtual machines.
- **GIL (Global Interpreter Lock)**: A thread lock preventing multiple native threads from running bytecode at once, limiting CPU-bound concurrency.
- **Reference Counting**: GC decrements count references. When count equals 0, memory is freed.`
  }
];
