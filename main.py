"""A simple interactive command-line calculator."""

def add(x: float, y: float) -> float:
    """Return the sum of x and y."""
    return x + y

def subtract(x: float, y: float) -> float:
    """Return the difference of x and y."""
    return x - y

def multiply(x: float, y: float) -> float:
    """Return the product of x and y."""
    return x * y

def divide(x: float, y: float) -> float:
    """Return the quotient of x and y. Raises ZeroDivisionError if y is zero."""
    if y == 0:
        raise ZeroDivisionError("Cannot divide by zero.")
    return x / y

def power(x: float, y: float) -> float:
    """Return x raised to the power of y."""
    return x ** y

def modulo(x: float, y: float) -> float:
    """Return the remainder of x divided by y."""
    if y == 0:
        raise ZeroDivisionError("Cannot calculate modulo with zero divisor.")
    return x % y

OPERATIONS = {
    "+": ("Add", add),
    "-": ("Subtract", subtract),
    "*": ("Multiply", multiply),
    "/": ("Divide", divide),
    "^": ("Power", power),
    "%": ("Modulo", modulo),
}

def display_menu() -> None:
    """Print the available calculator operations."""
    print("\n--- Basic Calculator ---")
    print("Available operations:")
    for symbol, (name, _) in OPERATIONS.items():
        print(f"  {symbol} : {name}")
    print("Type 'q' or 'exit' at any prompt to quit.")

def get_number(prompt: str) -> float | None:
    """Prompt the user for a valid floating-point number.
    Returns None if user requests to quit.
    """
    while True:
        user_input = input(prompt).strip()
        if user_input.lower() in ("q", "exit", "quit"):
            return None
        try:
            return float(user_input)
        except ValueError:
            print("Invalid input. Please enter a valid number.")

def get_operator() -> str | None:
    """Prompt user for a valid operator from OPERATIONS.
    Returns None if user requests to quit.
    """
    valid_ops = list(OPERATIONS.keys())
    while True:
        op = input(f"Enter operator ({', '.join(valid_ops)}): ").strip()
        if op.lower() in ("q", "exit", "quit"):
            return None
        if op in OPERATIONS:
            return op
        print(f"Invalid operator. Please choose from: {', '.join(valid_ops)}")

def main() -> None:
    """Main calculator loop."""
    display_menu()

    while True:
        print("\n" + "=" * 30)
        num1 = get_number("Enter the first number: ")
        if num1 is None:
            break

        operator = get_operator()
        if operator is None:
            break

        num2 = get_number("Enter the second number: ")
        if num2 is None:
            break

        _, func = OPERATIONS[operator]
        try:
            result = func(num1, num2)
            # Format numbers as integers if they have no fractional part
            if isinstance(result, float) and result.is_integer():
                result = int(result)
            if isinstance(num1, float) and num1.is_integer():
                num1 = int(num1)
            if isinstance(num2, float) and num2.is_integer():
                num2 = int(num2)

            print(f"\nResult: {num1} {operator} {num2} = {result}")
        except ZeroDivisionError as err:
            print(f"\nMath Error: {err}")
        except OverflowError:
            print("\nError: The result is too large to represent.")
        except Exception as err:
            print(f"\nError: {err}")

    print("\nThank you for using the calculator. Goodbye!")



if __name__ == "__main__":
    main()
