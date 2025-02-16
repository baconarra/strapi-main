#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main(int argc, char *argv[]) {
    int ret_code;
    int prompt = 0;

    if (argc > 1 && strcmp(argv[1], "--prompt") == 0) {
        prompt = 1;
    }
    
    while (1) {
        printf("Checking file integrity...\n");
		system("cls");
        ret_code = system("yarn develop --no-watch-admin");

        if (ret_code != 0) {
            printf("An error occurred, reinstalling strapi...\n");
            system("rd /s /q node_modules");
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



