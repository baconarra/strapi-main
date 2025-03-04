#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#ifdef _WIN32
    #define CLEAR_SCREEN "cls"
    #define REMOVE_NODE_MODULES "rd /s /q node_modules"
#else
    #define CLEAR_SCREEN "clear"
    #define REMOVE_NODE_MODULES "rm -rf node_modules"
#endif

int main(int argc, char *argv[]) {
    int ret_code;
    int prompt = 0;

    if (argc > 1 && strcmp(argv[1], "--prompt") == 0) {
        prompt = 1;
    }
    
    while (1) {
        printf("Checking file integrity...\n");
        system(CLEAR_SCREEN);
        ret_code = system("yarn develop --no-watch-admin");

        if (ret_code != 0) {
            printf("An error occurred, reinstalling Strapi...\n");
            system(REMOVE_NODE_MODULES);
            system("yarn");
        }

        if (prompt) {
            char choice;
            printf("Do you want to continue? (y/n): ");
            scanf(" %c", &choice);
            if (choice != 'y' && choice != 'Y') {
                printf("Exiting program...\n");
                break;
            }
        }
    }

    return 0;
}
