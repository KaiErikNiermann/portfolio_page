---
title: Simplifying python unittests using `inspect`
description: I ran into a mildly interesting problem of wanting to run the same unit tests on multiple functions of a class without having to call each function individually, this is a short writeup of how I solved this problem and in the process found a nice way to only have to write a minimal number of tests
published: '2024-04-14'
tags:
  - Python
  - Pytest
  - Poetry
---

So for example say you had a class like this
```python 
class Testing: 
    def give_first(self, nums): 
        return nums[0]
    
    def give_first_alt(self, nums): 
        return nums[:-1][0]
```
## Bad 
For both of these classes, you expect the same outputs for a given input. Now the straightforward way of writing tests for this would be.
```python 
from src import main

import unittest

class TestSolution(unittest.TestCase): 
    def test_give_first(self): 
        self.assertEqual(main.Testing().give_first([1, 2, 3]), 1)
        self.assertEqual(main.Testing().give_first_alt([1, 2, 3]), 1)
        self.assertEqual(main.Testing().give_first([4, 5, 6]), 4)
        self.assertEqual(main.Testing().give_first_alt([4, 5, 6]), 4)
        self.assertEqual(main.Testing().give_first([7, 8, 9]), 7)
        self.assertEqual(main.Testing().give_first_alt([7, 8, 9]), 7)
        
if __name__ == "__main__": 
    unittest.main()
```
Which using pytest you can run with `pytest tests/tests.py`. But I kinda felt like this was quite annoying, for two main reasons 
- You are just plainly writing repeated code 
- It's annoying to maintain, especially as we scale up to more of the same function 

## Better

So remembering that you can dynamically access class methods in Python I started off with a simple approach using the `inspect.getmembers` function 
```python
def test_give_first(self): 
    methods = []
    for _, method in inspect.getmembers(
        main.Testing, predicate=inspect.isfunction
    ): methods.append(method)
    
    for method in methods: 
        self.assertEqual(method(main.Testing(), [1, 2, 3]), 1)
        self.assertEqual(method(main.Testing(), [4, 5, 6]), 4)
        self.assertEqual(method(main.Testing(), [7, 8, 9]), 7)
```

This cleaned up things a bit, but then I realized if you have multiple classes that share this pattern it would make sense to have a separate method to give you the list of methods you could easily call for different test cases. So to our `TestSolution` class, we can add the following
```python
def method_gettr(problem) -> Generator[callable, None, None]: 
    for _, method in inspect.getmembers(
        problem, predicate=inspect.isfunction
    ): yield method
```

This simplifies our testing function down even further to the following 
```python
def test_give_first(self): 
    for method in TestSolution.method_gettr(main.Testing): 
        self.assertEqual(method(main.Testing(), [1, 2, 3]), 1)
        self.assertEqual(method(main.Testing(), [4, 5, 6]), 4)
        self.assertEqual(method(main.Testing(), [7, 8, 9]), 7)
```

## Even Better
For most cases, I think it's reasonable to stop at this point, but curiosity tends to get the better of me so I wanted to see if I could avoid having to write all those pesky `self.assertEqual` repeatedly. One thing we could do is create some structure to hold the inputs and outputs them loop through those. Which gives us 

```python
def test_give_first(self): 
    tests = [
        ([1, 2, 3], 1),
        ([4, 5, 6], 4),
        ([7, 8, 9], 7)
    ]
    for method in TestSolution.method_gettr(main.Testing): 
        for test in tests: 
            self.assertEqual(method(main.Testing(), test[0]), test[1])
```

## Best
And then finally I wanted to see if I could clean this up a bit more, so I created a helper function that would take in the class, the tests, and run them all for me. Which gives us 

```python
def run_tests(self, problem, tests): 
    for method in TestSolution.method_gettr(problem): 
        for test in tests: 
            self.assertEqual(method(problem(), test[0]), test[1])
```

And now our test function is simply 
```python
def test_give_first(self): 
    tests = [
        ([1, 2, 3], 1),
        ([4, 5, 6], 4),
        ([7, 8, 9], 7)
    ]
    self.run_tests(main.Testing, tests)
```

## Conclusion
This was a fun little exercise in trying to reduce the amount of code I had to write for tests. I think the final solution is quite clean and easy to maintain. I hope this was helpful to someone out there.
