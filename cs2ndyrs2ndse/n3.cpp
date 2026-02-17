#include <iostream>
#include <list>
#include <string>

int main() {
    std::list<std::string>* namesList = new std::list<std::string>();

    std::cout << " please enter the name Enter names " << std::endl;
    std::string input;
    while (true) {
        std::cin >> input;
        if (input == "done") {
            break;
        }
        namesList->push_back(input);
    }

    std::cout << "List of names:" << std::endl;
    for (const std::string& name : *namesList) {
        std::cout << name << std::endl;
    }

    delete namesList;  

    return 0;
}