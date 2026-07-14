import type { Topic } from './curriculumData';

export const dsaTopics: Topic[] = [
  {
    id: 'dsa-t1',
    name: 'Time & Space Complexity',
    buildFirst: true,
    visualizerId: 'dsa-complexity',
    starterCode: `# Compare complexity growth equations
def constant_time(n):
    return 1  # O(1)

def linear_time(n):
    ops = 0
    for i in range(n):
        ops += 1  # O(n)
    return ops

def quadratic_time(n):
    ops = 0
    for i in range(n):
        for j in range(n):
            ops += 1  # O(n^2)
    return ops
`,
    explanation: `### Time & Space Complexity (Big-O Notation)
Big-O notation describes the limiting behavior of an algorithm as the input size $N$ grows toward infinity.

#### Common Complexities:
- **$O(1)$ (Constant)**: Run-time is independent of $N$.
- **$O(\\log N)$ (Logarithmic)**: Search space is halved each step (e.g., Binary Search).
- **$O(N)$ (Linear)**: Operations grow proportionally to $N$.
- **$O(N \\log N)$ (Linearithmic)**: Efficient sorting bounds (e.g., Merge/Quick Sort).
- **$O(N^2)$ (Quadratic)**: Nested loops over input size.
- **$O(2^N)$ (Exponential)**: Doubling operations with each element addition (e.g., recursive subsets).

Slide the $N$ slider in the canvas above to visualize how rapidly operations explode for higher growth rates.`
  },
  {
    id: 'dsa-t2',
    name: 'Arrays & Subarrays',
    buildFirst: true,
    visualizerId: 'dsa-arrays',
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `def max_subarray_sum(arr):
    # Kadane's Algorithm for Maximum Subarray Sum
    max_so_far = arr[0]
    curr_max = arr[0]
    
    for i in range(1, len(arr)):
        curr_max = max(arr[i], curr_max + arr[i])
        max_so_far = max(max_so_far, curr_max)
        
    return max_so_far

test_arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]
print(f"Max subarray sum: {max_subarray_sum(test_arr)}")
`,
    explanation: `### Arrays & Subarrays: Sliding Window & Two Pointers
Arrays store data items in contiguous slots. Common subarray problems are solved using pointer strategies to optimize search ranges:

#### 1. Two Pointers
- Pointers placed on opposite ends (\`left\` and \`right\`) moving inwards, or next to each other.
- Reduces nesting from $O(N^2)$ to $O(N)$.

#### 2. Sliding Window
- A bounding box defined by a low and high index that expands/shrinks to track a active slice.
- Used for checking contiguous subsets.

Select the visualization tabs above to watch traversals, sliding windows, and pointers in action.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Demonstrates contiguous cell array insertions, deletions, sliding windows, and double pointers. Sliding windows maintain a valid subset slice, and two pointers index limits.',
        complexity: 'Time: O(N) | Space: O(1)',
        code: `def traverse_array(arr):
    # Two pointer traversal
    left = 0
    right = len(arr) - 1
    while left <= right:
        print(arr[left], arr[right])
        left += 1
        right -= 1
`
      },
      {
        title: 'Brute Force',
        explanation: 'Check every possible subarray using a nested double loop to find the maximum sum.',
        complexity: 'Time: O(N^2) | Space: O(1)',
        code: `def brute_force_max_subarray(arr):
    max_sum = float('-inf')
    n = len(arr)
    for i in range(n):
        curr_sum = 0
        for j in range(i, n):
            curr_sum += arr[j]
            max_sum = max(max_sum, curr_sum)
    return max_sum
`
      },
      {
        title: 'Optimal (Kadane)',
        explanation: 'Slide a window. If the current running sum drops below 0, reset the window starting index to the current index. This finds the maximum subarray in a single linear pass.',
        complexity: 'Time: O(N) | Space: O(1)',
        code: `def max_subarray_sum(arr):
    max_so_far = arr[0]
    curr_max = arr[0]
    for i in range(1, len(arr)):
        curr_max = max(arr[i], curr_max + arr[i])
        max_so_far = max(max_so_far, curr_max)
    return max_so_far
`
      }
    ]
  },
  {
    id: 'dsa-t3',
    name: 'Strings & Patterns',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Easy',
    starterCode: `def is_palindrome(s):
    # Filter non-alphanumeric and check reversal
    clean = "".join(char.lower() for char in s if char.isalnum())
    return clean == clean[::-1]

print("Is 'racecar' palindrome: ", is_palindrome("racecar"))
print("Is 'hello' palindrome:   ", is_palindrome("hello"))
`,
    explanation: `### Strings & Pattern Matching
Strings are characters arrays. Pattern matching searches for substrings.

#### Concepts:
- **Palindrome Checks**: Uses reverse slicing (\`[::-1]\`) or double pointers.
- **Anagram Checks**: Uses sorted listings or characters counters hash maps.
- **Advanced Substring Matching**: Knuth-Morris-Pratt (KMP) search algorithm in linear time.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Evaluate text slices, substring indexes, and pointers checks.',
        complexity: 'Time: O(N) | Space: O(1)',
        code: `# Evaluate strings properties`
      }
    ]
  },
  {
    id: 'dsa-t4',
    name: 'Matrix Traversal',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `def print_matrix(matrix):
    for row in matrix:
        print(row)

matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]
print_matrix(matrix)
`,
    explanation: `### Matrix Traversal (2D Arrays)
A Matrix is a grid-based grid structure indexed by \`matrix[row][col]\`.

#### Traversal Patterns:
- **Row-by-Row**: Standard nested loop scans.
- **Spiral Traversal**: Bounds variables (\`top, bottom, left, right\`) shifting boundary limits inwards sequentially.
- **Diagonals Traversal**: Sum index loops (\`row + col = constant\`).`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Scan 2D array row-wise, column-wise, or in custom spiral patterns.',
        complexity: 'Time: O(R * C) | Space: O(1)',
        code: `# Matrix loops`
      }
    ]
  },
  {
    id: 'dsa-t5',
    name: 'Binary Search',
    buildFirst: true,
    visualizerId: 'dsa-binary-search',
    isDSAProblem: true,
    difficulty: 'Easy',
    starterCode: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
            
    return -1

arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
print(f"Target 23 found at index: {binary_search(arr, 23)}")
`,
    explanation: `### Binary Search
Binary Search is a logarithmic search algorithm that finds the position of a target value within a **sorted** array.

#### How It Works:
1. Initialize \`low = 0\`, \`high = N - 1\`.
2. Find the midpoint \`mid = (low + high) // 2\`.
3. If \`arr[mid]\` matches target, return index.
4. If \`arr[mid]\` is smaller than target, the target must lie in the right half: \`low = mid + 1\`.
5. Otherwise, the target must lie in the left half: \`high = mid - 1\`.
6. Halves search space each step.

Step through the visualizer to see the exclusion zones fade out as pointers adapt.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Binary Search continually divides a sorted array in half. The search space is bounded by low (L) and high (R) pointers.',
        complexity: 'Time: O(log N) | Space: O(1)',
        code: `def binary_search_concept(arr, target):
    # Elements must be sorted!
    # L and R pointers define active bounds.
`
      },
      {
        title: 'Iterative approach',
        explanation: 'A clean while loop repeatedly calculates mid points, shifting L and R pointers without recursion overhead.',
        complexity: 'Time: O(log N) | Space: O(1)',
        code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
`
      },
      {
        title: 'Recursive approach',
        explanation: 'Divides search boundaries by passing low and high index scopes recursively down the call stack.',
        complexity: 'Time: O(log N) | Space: O(log N) stack frames',
        code: `def rec_binary_search(arr, low, high, target):
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    elif arr[mid] < target:
        return rec_binary_search(arr, mid + 1, high, target)
    else:
        return rec_binary_search(arr, low, mid - 1, target)
`
      }
    ]
  },
  {
    id: 'dsa-t6',
    name: 'Recursion & Backtracking',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Hard',
    starterCode: `def permute(nums):
    result = []
    def backtrack(start):
        if start == len(nums):
            result.append(nums[:])
            return
        for i in range(start, len(nums)):
            nums[start], nums[i] = nums[i], nums[start]  # Swap
            backtrack(start + 1)
            nums[start], nums[i] = nums[i], nums[start]  # Backtrack
    backtrack(0)
    return result

print("Permutations of [1, 2]: ", permute([1, 2]))
`,
    explanation: `### Recursion & Backtracking
Backtracking searches for solutions by building states recursively and discarding candidate states that fail conditions (backtracks).

#### Mechanics:
- **State Tree**: Explores paths depth-first.
- **Base Case**: Record valid solutions.
- **Undo Step**: Restores state registers upon recursion unwindings.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Depth-first search path finder that undoes changes when dead-ends are hit.',
        complexity: 'Time: O(N!) | Space: O(N) recursion depth',
        code: `# Backtracking structures`
      }
    ]
  },
  {
    id: 'dsa-t7',
    name: 'Linked List',
    buildFirst: true,
    visualizerId: 'dsa-linked-list',
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

# Slow and Fast Pointers for middle element
def find_middle(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.data
`,
    explanation: `### Linked Lists & Pointer Traversals
Unlike arrays, linked list elements are **not** contiguous in memory. Each node contains a value and a reference (\`next\`) to the next node.

#### Fast and Slow Pointers (Tortoise & Hare)
A powerful pointer strategy:
1. **Slow Pointer**: Moves one node at a time (\`slow = slow.next\`).
2. **Fast Pointer**: Moves two nodes at a time (\`fast = fast.next.next\`).
- When the fast pointer reaches the end, the slow pointer will be exactly at the middle!
- If the fast pointer ever catches up to the slow pointer, a cycle exists.

The visualizer shows slow (S) and fast (F) nodes traversing a linked list.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Nodes contain value and pointer properties. Pointers are reassigned dynamically, allowing insertion/deletion in O(1) without shifting.',
        complexity: 'Time: O(N) traversal | Space: O(1)',
        code: `class Node:
    def __init__(self, data):
        self.data = data
        self.next = None
`
      },
      {
        title: 'Brute Force (Middle)',
        explanation: 'Perform a full count of all list elements, then perform a second pass up to count/2 to find the middle node.',
        complexity: 'Time: O(N) | Space: O(1) - requires 2 passes',
        code: `def find_middle_two_pass(head):
    temp = head
    count = 0
    while temp:
        count += 1
        temp = temp.next
    
    mid = count // 2
    temp = head
    for _ in range(mid):
        temp = temp.next
    return temp.data
`
      },
      {
        title: 'Optimal (Tortoise/Hare)',
        explanation: 'Advance slow by 1 step and fast by 2 steps. The slow pointer lands precisely on the middle node at completion.',
        complexity: 'Time: O(N) | Space: O(1) - single pass',
        code: `def find_middle_optimal(head):
    slow = head
    fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.data
`
      }
    ]
  },
  {
    id: 'dsa-t8',
    name: 'Stack & Queue',
    buildFirst: true,
    visualizerId: 'dsa-stack-queue',
    isDSAProblem: true,
    difficulty: 'Easy',
    starterCode: `stack = []
# Push elements
stack.append(10)
stack.append(20)
stack.append(30)

print(f"Stack current: {stack}")
# Pop element (LIFO)
top = stack.pop()
print(f"Popped item: {top}")
print(f"Stack after: {stack}")
`,
    explanation: `### Stacks & Queues
Linear data structures governing data element insertions and retrievals:

#### 1. Stack (LIFO - Last In, First Out)
- Elements are added and removed from the *same* end (the top).
- Think of a stack of plates.
- Primary operations: \`push\` (append in Python) and \`pop\`.

#### 2. Queue (FIFO - First In, First Out)
- Elements are added at the rear and removed from the front.
- Think of a ticket counter line.
- Primary operations: \`enqueue\` and \`dequeue\`.

Use the Visualizer to slide items into a stack beaker or queue pathway.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Stacks stack elements vertically. Queues feed items horizontally. Ideal for expression evaluation and BFS traversal buffers.',
        complexity: 'All operations: O(1)',
        code: `# Stack LIFO
stack = []
stack.append(x) # Push
stack.pop()     # Pop

# Queue FIFO
from collections import deque
queue = deque()
queue.append(x) # Enqueue
queue.popleft() # Dequeue
`
      },
      {
        title: 'Stack Attempt',
        explanation: 'Simulate stack pushes and LIFO pops. Notice how items must be popped off top to access lower items.',
        complexity: 'Time: O(1) | Space: O(N)',
        code: `class Stack:
    def __init__(self):
        self.items = []
    def push(self, x):
        self.items.append(x)
    def pop(self):
        return self.items.pop() if self.items else None
`
      }
    ]
  },
  {
    id: 'dsa-t9',
    name: 'Hashing',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Easy',
    starterCode: `# Count frequencies using hash map dictionary
freq = {}
text = "pypath"

for char in text:
    freq[char] = freq.get(char, 0) + 1

print("Character frequencies: ", freq)
`,
    explanation: `### Hashing & Hash Tables
Hashing converts values into integer keys to map entries.

#### Properties:
- **$O(1)$ Operations**: Lookups, updates, and deletes are near-instant.
- **Collisions**: Managed by chaining (linked lists) or open addressing.
- **Use Cases**: Duplicate checks, frequency counts, mapping entries.`
  },
  {
    id: 'dsa-t10',
    name: 'Sorting Algorithms',
    buildFirst: true,
    visualizerId: 'dsa-sorting',
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr

test_arr = [64, 34, 25, 12, 22, 11, 90]
print(f"Sorted array: {bubble_sort(test_arr)}")
`,
    explanation: `### Sorting Algorithms
Sorting reorganizes elements of an array in ascending or descending order.

#### 1. Bubble Sort (Brute Force)
- Repeatedly compares adjacent elements and swaps them if out of order.
- Time Complexity: $O(N^2)$ average and worst-case.

#### 2. Merge Sort (Divide & Conquer)
- Recursively splits the array in halves, sorts each half, and merges them.
- Time Complexity: $O(N \\log N)$ stable. Space: $O(N)$.

#### 3. Quick Sort (Divide & Conquer)
- Picks a pivot element, partitions the array around it, and recurses.
- Time Complexity: $O(N \\log N)$ average. Space: $O(\\log N)$.

Step through the visualizer to see columns of heights swap in real-time.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Visual comparison of sorting algorithms. Swap and divide-and-conquer bounds are color-coded.',
        complexity: 'Varies from O(N log N) to O(N^2)',
        code: `# Compare Bubble, Merge, and Quick Sort algorithms`
      },
      {
        title: 'Bubble Sort',
        explanation: 'Simplistic adjacent comparisons. Large elements bubble to the right boundary.',
        complexity: 'Time: O(N^2) | Space: O(1)',
        code: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n - i - 1):
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr
`
      },
      {
        title: 'Merge Sort',
        explanation: 'Divide and conquer. Recursively split array, then merge sorted array halves.',
        complexity: 'Time: O(N log N) | Space: O(N)',
        code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    L = merge_sort(arr[:mid])
    R = merge_sort(arr[mid:])
    
    # Merge step
    res = []
    i = j = 0
    while i < len(L) and j < len(R):
        if L[i] < R[j]:
            res.append(L[i]); i += 1
        else:
            res.append(R[j]); j += 1
    res.extend(L[i:])
    res.extend(R[j:])
    return res
`
      }
    ]
  },
  {
    id: 'dsa-t11',
    name: 'Greedy Algorithms',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `def coin_change(coins, amount):
    # Greedy Coin Change (works only for canonical systems)
    coins.sort(reverse=True)
    count = 0
    for coin in coins:
        while amount >= coin:
            amount -= coin
            count += 1
    return count if amount == 0 else -1

print("Greedy coins for change 43: ", coin_change([1, 5, 10, 25], 43))
`,
    explanation: `### Greedy Algorithms
Greedy algorithms build solutions incrementally by making locally optimal choices at each step, hoping they lead to globally optimal solutions.

#### Mechanics:
- **Local Optimum**: Pick closest/largest/cheapest option.
- **No Backtracking**: Once choices are made, they are locked.
- **Failures**: Greedy approach fails on non-canonical systems (e.g. coin systems like [1, 3, 4] for amount 6, where dynamic programming is required).`
  },
  {
    id: 'dsa-t12',
    name: 'Trees & Traversals',
    buildFirst: true,
    visualizerId: 'dsa-trees',
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

# Preorder DFS
def dfs_preorder(root):
    if not root:
        return []
    return [root.val] + dfs_preorder(root.left) + dfs_preorder(root.right)
`,
    explanation: `### Binary Trees & Traversals
A Tree is a hierarchical structure consisting of nodes connected by edges, starting from a root node.

#### Tree Traversals:
1. **DFS (Depth-First Search)**
   - Explores as far as possible down each branch before backtracking.
   - Types: Preorder (Root-L-R), Inorder (L-Root-R), Postorder (L-R-Root).
   - Implemented using recursion or a Call Stack.

2. **BFS (Breadth-First Search / Level-Order)**
   - Visits nodes level-by-level from left to right.
   - Implemented using a **Queue**.

Watch nodes change color in preorder DFS or level BFS!`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Trees establish parent-child relationships. DFS navigates recursively down branches. BFS scans level-by-level.',
        complexity: 'Time: O(N) | Space: O(H) height',
        code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None
`
      },
      {
        title: 'Depth-First Search (DFS)',
        explanation: 'Depth-first search traverses in order recursively: left child, then right child.',
        complexity: 'Time: O(N) | Space: O(H)',
        code: `def inorder_dfs(root):
    if not root:
        return []
    return inorder_dfs(root.left) + [root.val] + inorder_dfs(root.right)
`
      },
      {
        title: 'Breadth-First Search (BFS)',
        explanation: 'Breadth-first search traverses level-by-level using an auxiliary queue.',
        complexity: 'Time: O(N) | Space: O(W) width',
        code: `from collections import deque
def bfs_level_order(root):
    if not root: return []
    res, queue = [], deque([root])
    while queue:
        node = queue.popleft()
        res.append(node.val)
        if node.left: queue.append(node.left)
        if node.right: queue.append(node.right)
    return res
`
      }
    ]
  },
  {
    id: 'dsa-t13',
    name: 'Binary Search Trees',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `class BSTNode:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

def insert_bst(root, val):
    if not root:
        return BSTNode(val)
    if val < root.val:
        root.left = insert_bst(root.left, val)
    else:
        root.right = insert_bst(root.right, val)
    return root
`,
    explanation: `### Binary Search Trees (BST)
BST is a binary tree where each node matches this structural property:
- **Left Subtree**: Contains only values smaller than node.
- **Right Subtree**: Contains only values greater than node.

#### Operations:
- **Search & Insert**: $O(\\log N)$ average, $O(N)$ worst case.
- **Inorder Traversal**: Accessing BST elements inorder returns them sorted.`
  },
  {
    id: 'dsa-t14',
    name: 'Heaps & Priority Queues',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `import heapq

# Min-heap usage
heap = []
heapq.heappush(heap, 40)
heapq.heappush(heap, 10)
heapq.heappush(heap, 30)

print("Popped smallest element: ", heapq.heappop(heap))
`,
    explanation: `### Heaps & Priority Queues
Heaps are binary trees matching the **Heap Property**:
- **Min-Heap**: Parent values are smaller than children. Root is minimum.
- **Max-Heap**: Parent values are greater than children. Root is maximum.

#### Operations:
- **Push / Pop**: $O(\\log N)$ insertion or removal.
- **Peek**: $O(1)$ retrieves root node.`
  },
  {
    id: 'dsa-t15',
    name: 'Graphs & Algorithms',
    buildFirst: true,
    visualizerId: 'dsa-graphs',
    isDSAProblem: true,
    difficulty: 'Hard',
    starterCode: `import heapq

def dijkstra(graph, start):
    # Dijkstra's Shortest Path Algorithm
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)] # heap of (distance, node)
    
    while pq:
        curr_dist, curr_node = heapq.heappop(pq)
        if curr_dist > distances[curr_node]:
            continue
            
        for neighbor, weight in graph[curr_node].items():
            dist = curr_dist + weight
            if dist < distances[neighbor]:
                distances[neighbor] = dist
                heapq.heappush(pq, (dist, neighbor))
                
    return distances

# Example graph
graph = {
    'A': {'B': 4, 'C': 2},
    'B': {'C': 1, 'D': 5},
    'C': {'B': 1, 'D': 8, 'E': 10},
    'D': {'E': 2},
    'E': {}
}
print(f"Shortest distances: {dijkstra(graph, 'A')}")
`,
    explanation: `### Graphs & Pathfinding (Dijkstra's Algorithm)
A Graph is a set of vertices (nodes) connected by edges.

#### Dijkstra's Algorithm (Shortest Path)
Finds the shortest path from a starting node to all other nodes in a weighted graph (non-negative weights):
1. Assign distance \`0\` to start, and infinity ($\infty$) to other nodes.
2. Push start node to a Priority Queue (Min-Heap) as \`(0, start)\`.
3. Pop node with the smallest distance. Iterate neighbors.
4. If a path to neighbor is shorter: update distance and push to Heap.
5. Repeat until the Heap is empty.

Step through the network simulation to see edge weights and Dijkstra relaxations.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'Graphs connect node networks with directional or weighted edges. Dijkstra calculates shortest path configurations.',
        complexity: 'Time: O((V+E) log V) | Space: O(V)',
        code: `# Graph node routing and Dijkstra implementation`
      },
      {
        title: 'Dijkstra Implementation',
        explanation: 'Maintains a min-heap queue to extract the closest node, relaxing adjacent edges step-by-step.',
        complexity: 'Time: O((V+E) log V) | Space: O(V)',
        code: `import heapq
def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    while pq:
        curr_dist, curr_node = heapq.heappop(pq)
        if curr_dist > distances[curr_node]: continue
        for neighbor, weight in graph[curr_node].items():
            d = curr_dist + weight
            if d < distances[neighbor]:
                distances[neighbor] = d
                heapq.heappush(pq, (d, neighbor))
    return distances
`
      }
    ]
  },
  {
    id: 'dsa-t16',
    name: 'Tries',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Medium',
    starterCode: `class TrieNode:
    def __init__(self):
        self.children = {}
        self.is_word = False
`,
    explanation: `### Tries (Prefix Trees)
Tries are multiway tree search structures used for string prefix lookups.

#### Key Mechanics:
- **Nodes**: Each node represents a single character lookup.
- **Lookup efficiency**: Find word in $O(L)$ where $L$ is length, independent of total dictionary sizes.
- **Use Cases**: Autocomplete, spell check, IP routers.`
  },
  {
    id: 'dsa-t17',
    name: 'Dynamic Programming',
    buildFirst: true,
    visualizerId: 'dsa-dp',
    isDSAProblem: true,
    difficulty: 'Hard',
    starterCode: `def fib_dp(n):
    # Bottom-up Tabulation Fibonacci
    if n <= 1:
        return n
    dp = [0] * (n + 1)
    dp[1] = 1
    
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
        
    return dp[n]

print(f"Fibonacci(6): {fib_dp(6)}")
`,
    explanation: `### Dynamic Programming (DP)
Dynamic Programming solves complex optimization problems by breaking them down into overlapping subproblems, solving each once, and storing their solutions.

#### Two Main Approaches:
1. **Top-Down (Memoization)**: Solves recursively and caches values in a dictionary/array.
2. **Bottom-Up (Tabulation)**: Solves iteratively from basic base cases up, filling a DP grid or table.

#### Fibonacci Example:
- Subproblem dependency: \`dp[i] = dp[i-1] + dp[i-2]\`.

Watch cells fill in the DP table above to see how subproblems build the global solution.`,
    dsaTabs: [
      {
        title: 'Concept',
        explanation: 'DP prevents redundant computations by caching subproblem answers. Tabulation solves iteratively bottom-up.',
        complexity: 'Time: O(N) | Space: O(N) or O(1)',
        code: `# Fibonacci subproblem grid calculations`
      },
      {
        title: 'Top-Down (Memo)',
        explanation: 'Recursion with cache. If result is already in memo dictionary, return it immediately.',
        complexity: 'Time: O(N) | Space: O(N) cache + recursion stack',
        code: `def fib_memo(n, memo={}):
    if n in memo: return memo[n]
    if n <= 1: return n
    memo[n] = fib_memo(n-1, memo) + fib_memo(n-2, memo)
    return memo[n]
`
      },
      {
        title: 'Bottom-Up (Tabulation)',
        explanation: 'Fill an array DP table iteratively, computing cells based on lower-indexed answers.',
        complexity: 'Time: O(N) | Space: O(N) array size',
        code: `def fib_tab(n):
    if n <= 1: return n
    dp = [0] * (n + 1)
    dp[1] = 1
    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]
`
      }
    ]
  },
  {
    id: 'dsa-t18',
    name: 'Bit Manipulation',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Easy',
    starterCode: `# Bitwise operations checks
x = 5  # 0101
y = 3  # 0011

print("Bitwise AND (x & y):", x & y)  # 0001
print("Bitwise XOR (x ^ y):", x ^ y)  # 0110
print("Left Shift (x << 1):", x << 1) # 1010
`,
    explanation: `### Bit Manipulation
Bitwise operations manipulate integer variables directly in binary bit formats.

#### Operators:
- **\`&\` (AND)**: True only if both bits are 1.
- **\`|\` (OR)**: True if either bit is 1.
- **\`^\` (XOR)**: True if bits are different.
- **\`<<\` / \`>>\` (Shifts)**: Multiplies/divides integers by powers of 2.`
  },
  {
    id: 'dsa-t19',
    name: 'Advanced Data Structures',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Hard',
    starterCode: `# Advanced Segment Tree node sketch
class SegmentTree:
    def __init__(self, arr):
        self.n = len(arr)
        self.tree = [0] * (4 * self.n)
`,
    explanation: `### Advanced Data Structures
Structures designed to solve specialized query bounds:

#### Types:
- **Segment Trees**: Handle range queries and range updates in $O(\\log N)$.
- **DSU (Disjoint Set Union)**: Check cluster connections in near-constant time.
- **LRU Cache**: Double linked list + hash map layout preserving access priorities.`
  },
  {
    id: 'dsa-t20',
    name: 'Design Questions',
    buildFirst: true,
    isDSAProblem: true,
    difficulty: 'Hard',
    starterCode: `class LRUCache:
    def __init__(self, capacity):
        self.capacity = capacity
        self.cache = {} # key -> node
`,
    explanation: `### Low-Level Design (LLD) Questions
LLD challenges require structuring solid blueprints matching OOP design practices:

#### Topics:
- **LRU Cache**: Custom key lookups evicting least-recently-accessed nodes.
- **Twitter/Feed Systems**: Fan-outs, postings, follower mappings.
- **File System / Parking Lot**: Abstraction trees, slot states check registers.`
  }
];
