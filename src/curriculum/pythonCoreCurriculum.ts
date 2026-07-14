import type { Topic } from './curriculumData';

export const phase1Topics: Topic[] = [
  {
    id: 'p1-t1',
    name: 'Introduction to Python',
    buildFirst: true,
    starterCode: `# Welcome to PyPath! Let's run your first Python script.
name = "PyPath Learner"
print(f"Hello, {name}!")
print("Python is compiled to Bytecode first, then interpreted by CPython WASM.")
`,
    explanation: `### Introduction to Python

#### 1. What is Python?
Python is a high-level, interpreted, and general-purpose programming language created to make programming simple, readable, and efficient. It allows developers to build everything from simple scripts to large-scale applications with minimal code. Python follows a clean syntax that is easy to learn, making it one of the most popular programming languages for beginners and professionals alike.

#### 2. History of Python
Python was created by Guido van Rossum and first released in 1991. It was designed to improve code readability and developer productivity. Over the years, Python has evolved into one of the most widely used programming languages across industries. Today, Python 3 is the standard version used for modern development.

#### 3. Features of Python
- Easy to learn and read
- Simple and clean syntax
- Interpreted language
- Open-source and free
- Cross-platform compatibility
- Object-Oriented Programming support
- Large standard library
- Dynamic typing
- Automatic memory management
- Extensive third-party packages

#### 4. Why Learn Python?
Python is an excellent first programming language because it is simple to understand and has a wide range of applications. Learning Python opens opportunities in software development, web development, data science, artificial intelligence, cybersecurity, automation, cloud computing, and DevOps.

#### 5. Applications of Python
- Web Development
- Data Science
- Machine Learning
- Artificial Intelligence
- Automation and Scripting
- Cybersecurity
- Game Development
- Desktop Applications
- Web Scraping
- Internet of Things (IoT)
- Cloud Computing
- APIs and Backend Development

#### 6. Advantages of Python
- Beginner-friendly
- Less code compared to many languages
- Huge developer community
- Thousands of open-source libraries
- Platform independent
- Fast development process
- Strong industry demand
- Excellent documentation

#### 7. Installing Python
1. Download Python from the official website.
2. Run the installer.
3. Select **Add Python to PATH**.
4. Click **Install Now**.
5. Verify installation using:
   \`python --version\`

#### 8. Setting Up VS Code
1. Install Visual Studio Code.
2. Install the Python extension.
3. Create a new folder.
4. Create a file named \`main.py\`.
5. Select the Python interpreter.
6. Run the program using the Run button or terminal.

#### 9. Your First Python Program
\`\`\`python
print("Hello, World!")
\`\`\`

**Output:**
\`\`\`
Hello, World!
\`\`\`

#### 10. Comments in Python
Comments are used to explain code and improve readability.

**Single-line Comment:**
\`\`\`python
# This is a comment
print("Python")
\`\`\`

**Multi-line Comment:**
\`\`\`python
"""
This is a
multi-line comment.
"""
\`\`\`

#### 11. Basic Syntax Rules
- Python uses indentation instead of braces.
- Statements are written line by line.
- Variable names are case-sensitive.
- Keywords cannot be used as variable names.
- Parentheses are required for function calls.

#### 12. Indentation
Python uses indentation to define blocks of code. The recommended indentation is 4 spaces.

**Correct:**
\`\`\`python
if True:
    print("Welcome")
\`\`\`

**Incorrect:**
\`\`\`python
if True:
print("Welcome")
\`\`\`

#### 13. print() Function
The \`print()\` function displays output on the screen.
\`\`\`python
print("Welcome to Python")
print(100)
print(True)
\`\`\`

#### 14. input() Function
The \`input()\` function accepts user input from the keyboard.
\`\`\`python
name = input("Enter your name: ")
print("Hello", name)
\`\`\`

#### 15. Best Practices
- Use meaningful variable names.
- Follow proper indentation.
- Write comments only when necessary.
- Keep code simple and readable.
- Practice regularly.

#### 16. Summary
- Python is a beginner-friendly programming language.
- It is interpreted, open-source, and cross-platform.
- Python is widely used in web development, AI, automation, cybersecurity, and data science.
- Programs are written in \`.py\` files.
- Proper indentation is essential.
- \`print()\` displays output, and \`input()\` accepts user input.`
  },
  {
    id: 'p1-t2',
    name: 'Variables & Memory',
    buildFirst: true,
    visualizerId: 'variables-memory',
    starterCode: `# Try modifying variable assignments and run the code!
a = 10
b = a
a = 20
print(f"a: {a}, b: {b}")
`,
    explanation: `### Variables & Memory in Python
In Python, variables are **not** boxes that contain values. Instead, variables are **names** (references) that point to **objects** stored in memory (RAM).

#### Key Concepts:
1. **Object Creation**: When you execute \`a = 10\`, Python creates an integer object with the value \`10\` at some memory address, and binds the name \`a\` to it.
2. **Multiple References**: When you execute \`b = a\`, Python does **not** copy the object. Instead, the name \`b\` is bound to the *same* memory address as \`a\`.
3. **Re-binding**: If you then run \`a = 20\`, Python creates a new integer object \`20\` at a new memory address, and re-binds \`a\` to it. The variable \`b\` still points to \`10\`.
4. **Id Function**: You can inspect the memory address using the built-in \`id(variable)\` function.

Use the visualization panel above to step through this reference binding in real-time!`
  },
  {
    id: 'p1-t3',
    name: 'Data Types',
    buildFirst: true,
    visualizerId: 'data-types',
    starterCode: `# Explore different data types in Python
x = 42           # Integer (immutable)
y = 3.14         # Float (immutable)
s = "PyPath"     # String (immutable)
lst = [1, 2, 3]  # List (mutable)
d = {"a": 1}     # Dictionary (mutable)

# Modify a mutable data type
lst.append(4)
print(f"List after append: {lst}")
`,
    explanation: `### Python Data Types & Mutability
Python classifies its data types based on whether their values can be modified in place after creation:

#### 1. Immutable Types (Cannot change in-place)
- **int, float, bool, str, tuple**: Modifying an immutable variable creates a *new* object in memory.
- Example: Concatenating strings (\`s = s + "!"\`) creates a brand new string object.

#### 2. Mutable Types (Can change in-place)
- **list, dict, set**: Modifying these types edits the object's contents directly at its existing memory address.
- Example: Appending to a list (\`lst.append(4)\`) updates the same list structure.

Use the Visualizer to see how different containers behave when created and modified.`
  },
  {
    id: 'p1-t4',
    name: 'Operators',
    buildFirst: true,
    starterCode: `# Operations in Python
a = 15
b = 4

print("Arithmetic: a + b =", a + b)
print("Floor Division: a // b =", a // b)  # Drops fractional remainder
print("Modulo: a % b =", a % b)            # Returns division remainder
print("Exponent: b ** 2 =", b ** 2)        # Powers
`,
    explanation: `### Python Operators
Operators carry out logical, arithmetic, or bitwise operations.

#### Types of Operators:
1. **Arithmetic**: \`+\`, \`-\`, \`*\`, \`/\`, \`//\` (floor division), \`%\` (modulo), \`**\` (exponentiation).
2. **Comparison**: \`==\`, \`!=\`, \`>\`, \`<\`, \`>=\`, \`<=\`.
3. **Logical**: \`and\`, \`or\`, \`not\`.
4. **Bitwise**: \`&\`, \`|\`, \`^\` (XOR), \`~\` (NOT), \`<<\` (left shift), \`>>\` (right shift).`
  },
  {
    id: 'p1-t5',
    name: 'Input/Output',
    buildFirst: true,
    starterCode: `# Print formats and user configurations
name = "Antigravity"
version = 3.5

# Standard Formatting
print("Application: " + name + " version: " + str(version))

# F-Strings (Modern & Recommended)
print(f"Application: {name} | version: {version:.2f}")
`,
    explanation: `### Input/Output (I/O)
Python provides options for interacting with programs.

#### 1. Output (\`print\`)
- Renders text to standard output (\`stdout\`).
- Use **F-Strings** (\`f"Hello {name}"\`) for modern, fast variable interpolations.

#### 2. Input (\`input\`)
- Reads a line of input string from standard input stream.
- Note: Always wrap inside type castings like \`int()\` or \`float()\` if numerical inputs are expected.`
  }
];

export const phase2Topics: Topic[] = [
  {
    id: 'p2-t1',
    name: 'Conditionals',
    buildFirst: true,
    visualizerId: 'conditionals',
    starterCode: `# Try changing the age value and run the code!
age = 18

if age < 13:
    print("Child")
elif age < 20:
    print("Teenager")
else:
    print("Adult")
`,
    explanation: `### Conditional Statements (\`if-elif-else\`)
Conditionals control program execution paths by evaluating boolean conditions (\`True\` or \`False\`).

#### Key Operations:
- **\`if\`**: Evaluates the initial condition. If true, the block executes, and the rest of the branch is skipped.
- **\`elif\`**: Evaluated sequentially only if all preceding conditions were false.
- **\`else\`**: Executes if and only if none of the preceding conditions were true.

The visualizer below maps this control flow as a decision tree. Step through to watch the active path light up based on variable checks.`
  },
  {
    id: 'p2-t2',
    name: 'Loops',
    buildFirst: true,
    visualizerId: 'loops',
    starterCode: `# Watch how the loop updates the counter!
total = 0
for i in range(4):
    total += i
    print(f"i: {i}, total: {total}")
`,
    explanation: `### Loop Iterations (\`for\` and \`while\`)
Loops enable repetitive execution of a block of code based on conditions.

#### Key Types:
1. **\`for\` Loop**: Typically used to iterate over a sequence (range, list, string, etc.). Uses an iterator under the hood.
2. **\`while\` Loop**: Continues execution as long as a condition evaluates to \`True\`.

#### Loop Control:
- **\`break\`**: Terminate the loop immediately.
- **\`continue\`**: Skip the rest of the current iteration and jump to the next condition check.

Use the visualizer to trace a counter token circulating through the loop flowchart, incrementing step-by-step.`
  },
  {
    id: 'p2-t3',
    name: 'Pattern Programs',
    buildFirst: true,
    starterCode: `# Draw a simple right-angle triangle pattern
rows = 5
for i in range(1, rows + 1):
    print("*" * i)
`,
    explanation: `### Pattern Programs
Pattern programs use nested loops to generate coordinate shapes and text grids.

#### Key Concepts:
- **Outer Loop**: Controls the row index height (vertical axis).
- **Inner Loop**: Controls the column counts or characters printed per line (horizontal axis).
- **String Multiplication**: Python allows multiplying characters (\`"*" * 3\` produces \`"***"\`), simplifying pattern generation.`
  }
];

export const phase3Topics: Topic[] = [
  {
    id: 'p3-t1',
    name: 'Indexing/Slicing',
    buildFirst: true,
    visualizerId: 'indexing-slicing',
    starterCode: `# Modify the indices and run to slice a string!
text = "PYTHON"
slice1 = text[1:5]
slice2 = text[-4:-1]
print(f"text[1:5]: {slice1}")
print(f"text[-4:-1]: {slice2}")
`,
    explanation: `### String Indexing & Slicing
Strings in Python are sequences of characters. You can access individual characters or sub-strings using brackets \`[]\`.

#### 1. Zero-Based Indexing
- **Positive Indices**: Start from \`0\` on the left and go right.
- **Negative Indices**: Start from \`-1\` on the right and go left.

| P | Y | T | H | O | N |
|---|---|---|---|---|---|
| 0 | 1 | 2 | 3 | 4 | 5 |
| -6| -5| -4| -3| -2| -1|

#### 2. Slicing Syntax: \`string[start:stop:step]\`
- **\`start\`**: Inclusive index (defaults to 0).
- **\`stop\`**: Exclusive index (defaults to length).
- **\`step\`**: Index increment (defaults to 1).

Step through the Indexing Visualizer to see which letters are sliced!`
  },
  {
    id: 'p3-t2',
    name: 'Methods',
    buildFirst: true,
    starterCode: `text = "  python programming language  "

# String mutations
print("Cleaned text: ", text.strip())
print("Upper Case:   ", text.upper())
print("Replaced string:", text.replace("python", "C++"))
print("Word list:    ", text.split())
`,
    explanation: `### String Methods
Python provides a rich library of string processing methods.

#### Common Operations:
- **\`.strip()\`**: Removes leading and trailing whitespace from the string.
- **\`.upper() / .lower()\`**: Transforms characters to upper or lower case.
- **\`.replace(old, new)\`**: Swaps substrings.
- **\`.split(separator)\`**: Divides strings into lists based on separator marks.`
  },
  {
    id: 'p3-t3',
    name: 'Regex',
    buildFirst: true,
    starterCode: `import re

text = "Please reach out to support@pypath.org or admin@pypath.com."
emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', text)

print("Extracted emails: ", emails)
`,
    explanation: `### Regular Expressions (\`re\` Module)
Regular expressions (regex) are query strings search syntax patterns.

#### Key Functions:
- **\`re.findall(pattern, text)\`**: Finds all non-overlapping matches, returning them as list.
- **\`re.search(pattern, text)\`**: Scans string returning match objects.
- **\`re.sub(pattern, replacement, text)\`**: Replaces matches with custom strings.`
  }
];

export const phase4Topics: Topic[] = [
  {
    id: 'p4-t1',
    name: 'Lists',
    buildFirst: true,
    visualizerId: 'lists',
    starterCode: `# Watch the array resize under the hood as you append!
lst = []
for val in [10, 20, 30, 40, 50]:
    lst.append(val)
    print(f"List: {lst}")
`,
    explanation: `### Python Lists & Dynamic Arrays
Python lists are **dynamic arrays**. They store references to objects in contiguous memory locations.

#### Key Mechanics:
1. **Contiguous Storage**: Elements are stored sequentially. Access by index is $O(1)$.
2. **Dynamic Capacity**: Under the hood, Python overallocates capacity to handle future appends.
3. **Resizing (Amortized $O(1)$)**: When the array fills up:
   - A new larger memory block is allocated (usually $1.125 \times$ to $2\times$ size).
   - All references are copied from the old array to the new one.
   - The old array is released.

The visualizer simulates how list sizes grow and trigger capacity doubling operations.`
  },
  {
    id: 'p4-t2',
    name: 'Tuples',
    buildFirst: true,
    starterCode: `# Explore Tuple coordinates and unpackings
point = (4, 5, 6)
x, y, z = point  # Unpacking values

print(f"x: {x}, y: {y}, z: {z}")
print(f"Tuple length: {len(point)}")
`,
    explanation: `### Tuples
Tuples are **immutable** ordered sequences of elements.

#### Key Properties:
- **Immutability**: Once created, elements cannot be inserted, replaced, or removed.
- **Hashability**: Since they are immutable, tuples containing only hashable types can act as keys inside dictionaries or items in sets.
- **Unpacking**: Unpack tuple elements directly into discrete variable names (\`x, y = (10, 20)\`).`
  },
  {
    id: 'p4-t3',
    name: 'Sets',
    buildFirst: true,
    starterCode: `s1 = {1, 2, 3, 4}
s2 = {3, 4, 5, 6}

print("Union s1 | s2:        ", s1 | s2)
print("Intersection s1 & s2: ", s1 & s2)
print("Difference s1 - s2:     ", s1 - s2)
`,
    explanation: `### Sets
Sets are unordered collections of **unique, hashable** elements.

#### Key Properties:
- **Hashing Lookup**: Lookup times are extremely fast ($O(1)$) because sets are built using hash-table mechanics.
- **Unique elements**: Duplicates are automatically discarded.
- **Set Arithmetic**: Supports mathematical union (\`|\`), intersection (\`&\`), difference (\`-\`), and symmetric difference (\`^\`).`
  },
  {
    id: 'p4-t4',
    name: 'Dictionaries',
    buildFirst: true,
    starterCode: `# Dictionaries key value lookups
scores = {"Alice": 95, "Bob": 88}
scores["Charlie"] = 92  # Insert

for name, score in scores.items():
    print(f"Student: {name} -> Score: {score}")
`,
    explanation: `### Dictionaries
Dictionaries are unordered key-value hash mappings.

#### Key Properties:
- **Hash Table Engine**: Fast retrieval, insertion, and deletion averages of $O(1)$.
- **Keys**: Keys must be immutable and hashable (e.g. strings, integers, tuples).
- **Iteration**: Use \`.items()\` to iterate keys and values together, or \`.keys()\` and \`.values()\` for single parameters.`
  }
];

export const phase5Topics: Topic[] = [
  {
    id: 'p5-t1',
    name: 'def/return/params',
    buildFirst: true,
    visualizerId: 'functions',
    starterCode: `# Watch stack frames grow and shrink during calls!
def add(x, y):
    result = x + y
    return result

def main():
    a = 5
    b = 7
    val = add(a, b)
    print(f"Sum: {val}")

main()
`,
    explanation: `### Function Calls & The Call Stack
When a Python function is called, the interpreter allocates a **Stack Frame** in memory to store the function's local execution environment.

#### Key Elements of a Stack Frame:
- **Parameters**: Variable bindings passed by the caller (passed by reference/object-sharing).
- **Local Variables**: Variables defined inside the function.
- **Return Address**: Pointer to where the code should return after execution.

#### Lifecyle:
- **Function Call**: Pushes a new frame onto the top of the **Call Stack**.
- **Execution**: The function executes within its local frame scope.
- **Return**: Pops the frame off the stack and returns the resulting value to the caller.

The visualizer maps how local scopes stack up and dissolve in real-time.`
  },
  {
    id: 'p5-t2',
    name: 'Recursion',
    buildFirst: true,
    starterCode: `def factorial(n):
    # Base Case
    if n <= 1:
        return 1
    # Recursive Case
    return n * factorial(n - 1)

print("Factorial of 5: ", factorial(5))
`,
    explanation: `### Recursion
Recursion occurs when a function calls itself to break down problems.

#### Requirements:
1. **Base Case**: The condition under which the function stops calling itself and returns a static value. Crucial to prevent infinite recursion stack overflows!
2. **Recursive Case**: The function calls itself with a simpler subset of inputs, progressing towards the base case.
3. **Call Stack**: Each call allocates a stack frame, which waits until base returns.`
  },
  {
    id: 'p5-t3',
    name: 'Lambda Functions',
    buildFirst: true,
    starterCode: `# Double lambda and sum lambda examples
double = lambda x: x * 2
multiply = lambda x, y: x * y

print("Double of 6:   ", double(6))
print("Multiply 4 * 5:", multiply(4, 5))
`,
    explanation: `### Lambda Functions
Lambda functions are **anonymous** single-line functions.

#### Syntax:
\`lambda arguments: expression\`

#### Properties:
- **No Name**: They are defined without the \`def\` keyword.
- **Single Expression**: Limited to evaluating a single return statement.
- **Use Cases**: Useful as transient parameter inputs for higher-order functions like \`sort()\`, \`map()\`, or \`filter()\`.`
  },
  {
    id: 'p5-t4',
    name: 'Map, Filter, Reduce',
    buildFirst: true,
    starterCode: `from functools import reduce

nums = [1, 2, 3, 4, 5]

squares = list(map(lambda x: x**2, nums))
evens = list(filter(lambda x: x % 2 == 0, nums))
sum_all = reduce(lambda acc, x: acc + x, nums)

print("Squares: ", squares)
print("Evens:   ", evens)
print("Sum:     ", sum_all)
`,
    explanation: `### Map, Filter, and Reduce
Functional programming built-ins processing sequences:

#### Operations:
- **\`map(func, iterable)\`**: Applies a function to all items, returning a lazy map iterator.
- **\`filter(func, iterable)\`**: Keeps items evaluating to \`True\` under the check function.
- **\`reduce(func, iterable)\`**: Accumulates array values pairwise into a single final value (imported from \`functools\`).`
  },
  {
    id: 'p5-t5',
    name: 'Decorators',
    buildFirst: true,
    starterCode: `def log_decorator(func):
    def wrapper(*args, **kwargs):
        print("[Log] Executing function...")
        result = func(*args, **kwargs)
        print("[Log] Completed execution.")
        return result
    return wrapper

@log_decorator
def greet(name):
    print(f"Hello, {name}!")

greet("Pythonist")
`,
    explanation: `### Decorators
Decorators wrap functions to dynamically modify or augment their behaviors without altering the source code.

#### Key Mechanics:
- **First-Class Functions**: Python functions can be passed as arguments, assigned, and returned.
- **Wrapper closures**: The decorator takes a function as input, wraps it inside an inner wrapper function, and returns that wrapper.
- **\`@decorator\` syntax**: Syntactic sugar for reassigning \`func = decorator(func)\`.`
  },
  {
    id: 'p5-t6',
    name: 'Closures',
    buildFirst: true,
    starterCode: `def make_counter():
    count = 0
    def increment():
        nonlocal count
        count += 1
        return count
    return increment

counter = make_counter()
print("First call: ", counter())
print("Second call:", counter())
`,
    explanation: `### Closures
A closure is an inner function that retains lexical read/write access to variables in its outer enclosing scope, even after the outer function has completed execution.

#### Requirements:
1. An inner function defined inside an outer function.
2. The inner function references variables from the outer scope.
3. The outer function returns the inner function object.
4. Use the **\`nonlocal\`** keyword to modify enclosing variables in-place.`
  },
  {
    id: 'p5-t7',
    name: 'Generators',
    buildFirst: true,
    starterCode: `def fibonacci_gen(limit):
    a, b = 0, 1
    for _ in range(limit):
        yield a
        a, b = b, a + b

# Generate lazy values
for num in fibonacci_gen(6):
    print("Generated: ", num)
`,
    explanation: `### Generators
Generators are functions that return a **lazy** iterator, outputting values on-demand using the **\`yield\`** keyword.

#### Key Mechanics:
- **Lazy Evaluation**: Computes values only when requested, saving memory for large ranges.
- **\`yield\` vs \`return\`**: \`yield\` pauses function execution, saves its local variables, and returns a value. When called next, it resumes exactly where it paused.
- **Generator Objects**: Implements the iterator protocol (\`__next__\`).`
  }
];
